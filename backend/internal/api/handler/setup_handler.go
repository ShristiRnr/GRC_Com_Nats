package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"
	"fmt"
	"log"

	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/auth"
	"grc-compil/backend/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	SystemSetupCompletedKey = "system_setup_completed"
)

// GetSetupStatus checks if the system setup has been completed
func GetSetupStatus(store db.Querier) gin.HandlerFunc {
	return func(c *gin.Context) {
		config, err := store.GetSystemConfig(c.Request.Context(), SystemSetupCompletedKey)
		if err != nil {
			// If key doesn't exist, setup is not completed
			c.JSON(http.StatusOK, gin.H{"setup_completed": false})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"setup_completed": config.Value == "true",
		})
	}
}

// SetupSuperAdmin creates the super admin user (only works if setup not completed)
func SetupSuperAdmin(store db.Querier, authService auth.AuthService, b *broker.Broker, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required,min=3"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=8"`
			OrgName  string `json:"org_name" binding:"required,min=2"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			HandleBindingError(c, err)
			return
		}

		// Check if setup already completed (only true after email verification)
		config, err := store.GetSystemConfig(c.Request.Context(), SystemSetupCompletedKey)
		if err == nil && config.Value == "true" {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: system setup already completed"})
			return
		}

		// Check if username/email already exists (Standardize to generic message if already verified)
		existingUser, err := store.GetUserByUsername(c.Request.Context(), req.Username)
		userFound := err == nil
		if !userFound {
			existingUser, err = store.GetUserByEmail(c.Request.Context(), req.Email)
			userFound = err == nil
		}

		if userFound {
			if !existingUser.EmailVerified {
				// Resend verification (Silent success or informative message is fine here)
				c.JSON(http.StatusOK, gin.H{"message": "If an account with that email or username exists, a verification link has been sent."})
				return
			}
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: account already exists"})
			return
		}

		// Hash password with configured cost
		hashedPassword, err := util.HashPassword(req.Password, cfg.BcryptCost)
		if err != nil {
			HandleError(c, err)
			return
		}

		// Create organization
		org, err := store.CreateOrganization(c.Request.Context(), req.OrgName)
		if err != nil {
			HandleError(c, err)
			return
		}

		// Create super admin user
		pgToken := pgtype.Text{String: generateToken(), Valid: true}
		_, err = store.CreateUserWithVerification(c.Request.Context(), db.CreateUserWithVerificationParams{
			Username:                   req.Username,
			Email:                      req.Email,
			OrgID:                      org.ID,
			PasswordHash:               hashedPassword,
			Role:                       cfg.SuperAdminRole,
			EmailVerified:              false,
			VerificationToken:          pgToken,
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(cfg.VerificationDuration), Valid: true},
		})
		if err != nil {
			HandleError(c, err)
			return
		}

		// Publish verification email task to NATS queue
		err = b.Publish("email.send", gin.H{
			"type":     "verification",
			"to":       req.Email,
			"username": req.Username,
			"token":    pgToken.String,
		})
		if err != nil {
			log.Printf("Warning: failed to publish verification email: %v", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Super admin created successfully. Please check your email for verification.",
		})
	}
}

// Signup registers a new user
func Signup(store db.Querier, b *broker.Broker, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required,min=3"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=8"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			HandleBindingError(c, err)
			return
		}

		// Hash password first with configured cost
		hashedPassword, err := util.HashPassword(req.Password, cfg.BcryptCost)
		if err != nil {
			HandleError(c, err)
			return
		}

		// Get default organization
		orgs, err := store.ListOrganizations(c.Request.Context())
		if err != nil || len(orgs) == 0 {
			HandleError(c, fmt.Errorf("no organization available"))
			return
		}

		// Create user
		pgToken := pgtype.Text{String: generateToken(), Valid: true}
		_, err = store.CreateUserWithVerification(c.Request.Context(), db.CreateUserWithVerificationParams{
			Username:                   req.Username,
			Email:                      req.Email,
			OrgID:                      orgs[0].ID,
			PasswordHash:               hashedPassword,
			Role:                       cfg.UserRole,
			EmailVerified:              false,
			VerificationToken:          pgToken,
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(cfg.VerificationDuration), Valid: true},
		})
		if err != nil {
			// HandleError will catch duplicate keys and return generic 500
			HandleError(c, err)
			return
		}

		// Publish verification email task to NATS queue
		err = b.Publish("email.send", gin.H{
			"type":     "verification",
			"to":       req.Email,
			"username": req.Username,
			"token":    pgToken.String,
		})
		if err != nil {
			log.Printf("Warning: failed to publish verification email: %v", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User created successfully! Please check your email for verification.",
		})
	}
}

// VerifyEmail verifies a user's email
func VerifyEmail(store db.Querier, b *broker.Broker, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Param("token")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
			return
		}

		user, err := store.VerifyUserEmail(c.Request.Context(), pgtype.Text{String: token, Valid: true})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired verification token"})
			return
		}

		if user.Role == cfg.SuperAdminRole || user.Role == "super_admin" {
			_, _ = store.SetSystemConfig(c.Request.Context(), db.SetSystemConfigParams{
				Key:   SystemSetupCompletedKey,
				Value: "true",
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Email verified successfully! You can now log in.",
		})
	}
}

// ResendVerification resends the verification email
func ResendVerification(store db.Querier, b *broker.Broker, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email string `json:"email" binding:"required,email"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			HandleBindingError(c, err)
			return
		}

		user, err := store.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil || user.EmailVerified {
			// Generic message to avoid enumeration
			c.JSON(http.StatusOK, gin.H{"message": "If an account with that email exists and is not verified, a verification link has been sent."})
			return
		}

		_, err = store.UpdateVerificationToken(c.Request.Context(), db.UpdateVerificationTokenParams{
			VerificationToken:          pgtype.Text{String: generateToken(), Valid: true},
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(cfg.VerificationDuration), Valid: true},
			ID:                         user.ID,
		})
		if err != nil {
			HandleError(c, err)
			return
		}

		// Publish verification email task to NATS queue
		err = b.Publish("email.send", gin.H{
			"type":     "verification",
			"to":       user.Email,
			"username": user.Username,
			"token":    user.VerificationToken.String,
		})
		if err != nil {
			log.Printf("Warning: failed to publish verification email: %v", err)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Verification email sent successfully!"})
	}
}

// generateToken generates a secure random token
func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
