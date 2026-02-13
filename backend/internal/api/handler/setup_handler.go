package handler

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"time"

	"grc-compil/backend/internal/broker"
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
func SetupSuperAdmin(store db.Querier, authService auth.AuthService, b *broker.Broker) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required,min=3"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=8"`
			OrgName  string `json:"org_name" binding:"required,min=2"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if setup already completed (only true after email verification)
		config, err := store.GetSystemConfig(c.Request.Context(), SystemSetupCompletedKey)
		if err == nil && config.Value == "true" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "System setup already completed"})
			return
		}

		// Check if username already exists
		existingUser, err := store.GetUserByUsername(c.Request.Context(), req.Username)
		if err == nil {
			// User exists — check if they are unverified, and resend the verification email
			if !existingUser.EmailVerified {
				// Generate a fresh verification token and resend
				token := generateToken()
				expiresAt := time.Now().Add(24 * time.Hour)
				_, _ = store.UpdateVerificationToken(c.Request.Context(), db.UpdateVerificationTokenParams{
					VerificationToken:          pgtype.Text{String: token, Valid: true},
					VerificationTokenExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
					ID:                         existingUser.ID,
				})
				emailPayload := map[string]interface{}{
					"type":     "verification",
					"to":       existingUser.Email,
					"username": existingUser.Username,
					"token":    token,
				}
				_ = b.Publish("email.send", emailPayload)

				c.JSON(http.StatusOK, gin.H{
					"message":              "A verification email has already been sent to this account. We have resent a fresh activation link.",
					"verification_pending": true,
					"email":                existingUser.Email,
				})
				return
			}
			// User exists and is verified — setup is effectively done
			c.JSON(http.StatusBadRequest, gin.H{"error": "System setup already completed"})
			return
		}

		// Check if email already exists
		existingByEmail, err := store.GetUserByEmail(c.Request.Context(), req.Email)
		if err == nil {
			if !existingByEmail.EmailVerified {
				token := generateToken()
				expiresAt := time.Now().Add(24 * time.Hour)
				_, _ = store.UpdateVerificationToken(c.Request.Context(), db.UpdateVerificationTokenParams{
					VerificationToken:          pgtype.Text{String: token, Valid: true},
					VerificationTokenExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
					ID:                         existingByEmail.ID,
				})
				emailPayload := map[string]interface{}{
					"type":     "verification",
					"to":       existingByEmail.Email,
					"username": existingByEmail.Username,
					"token":    token,
				}
				_ = b.Publish("email.send", emailPayload)

				c.JSON(http.StatusOK, gin.H{
					"message":              "A verification email has already been sent to this account. We have resent a fresh activation link.",
					"verification_pending": true,
					"email":                existingByEmail.Email,
				})
				return
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": "System setup already completed"})
			return
		}

		// Hash password
		hashedPassword, err := util.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
			return
		}

		// Generate verification token
		token := generateToken()
		expiresAt := time.Now().Add(24 * time.Hour)

		// Create organization
		org, err := store.CreateOrganization(c.Request.Context(), req.OrgName)
		if err != nil {
			log.Printf("failed to create organization: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
			return
		}

		// Create super admin user with verification token (email NOT verified yet)
		user, err := store.CreateUserWithVerification(c.Request.Context(), db.CreateUserWithVerificationParams{
			Username:                   req.Username,
			Email:                      req.Email,
			OrgID:                      org.ID,
			PasswordHash:               hashedPassword,
			Role:                       "super_admin",
			EmailVerified:              false,
			VerificationToken:          pgtype.Text{String: token, Valid: true},
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
		})
		if err != nil {
			log.Printf("failed to create super admin user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
			return
		}

		// DO NOT mark setup as completed here — it will be set when email is verified

		// Send verification email via NATS
		emailPayload := map[string]interface{}{
			"type":     "verification",
			"to":       user.Email,
			"username": user.Username,
			"token":    token,
		}
		err = b.Publish("email.send", emailPayload)
		if err != nil {
			log.Printf("failed to publish verification email to NATS: %v", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Super admin created successfully. Please check your email for verification.",
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
				"role":     user.Role,
			},
		})
	}
}

// Signup registers a new user
func Signup(store db.Querier, b *broker.Broker) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required,min=3"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=8"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if username already exists
		_, err := store.GetUserByUsername(c.Request.Context(), req.Username)
		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already taken"})
			return
		}

		// Check if email already exists
		_, err = store.GetUserByEmail(c.Request.Context(), req.Email)
		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
			return
		}

		// Hash password
		hashedPassword, err := util.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
			return
		}

		// Generate verification token
		token := generateToken()
		expiresAt := time.Now().Add(24 * time.Hour)

		// Get default organization (or create one for new users)
		// For now, use the first organization
		orgs, err := store.ListOrganizations(c.Request.Context())
		if err != nil || len(orgs) == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No organization available"})
			return
		}

		// Create user with verification token
		user, err := store.CreateUserWithVerification(c.Request.Context(), db.CreateUserWithVerificationParams{
			Username:                   req.Username,
			Email:                      req.Email,
			OrgID:                      orgs[0].ID,
			PasswordHash:               hashedPassword,
			Role:                       "user",
			EmailVerified:              false,
			VerificationToken:          pgtype.Text{String: token, Valid: true},
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		// Send verification email via NATS
		emailPayload := map[string]interface{}{
			"type":     "verification",
			"to":       user.Email,
			"username": user.Username,
			"token":    token,
		}
		err = b.Publish("email.send", emailPayload)
		if err != nil {
			log.Printf("failed to publish verification email to NATS: %v", err)
			// Still return success for user creation
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User created successfully! Please check your email for verification.",
		})

	}
}

// VerifyEmail verifies a user's email using the verification token
func VerifyEmail(store db.Querier, b *broker.Broker) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Param("token")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
			return
		}

		// Verify the email using the token
		user, err := store.VerifyUserEmail(c.Request.Context(), pgtype.Text{String: token, Valid: true})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
			return
		}

		// If the verified user is a super_admin, mark system setup as completed
		if user.Role == "super_admin" {
			_, err = store.SetSystemConfig(c.Request.Context(), db.SetSystemConfigParams{
				Key:   SystemSetupCompletedKey,
				Value: "true",
			})
			if err != nil {
				log.Printf("failed to set system config after super_admin verification: %v", err)
			}
		}

		// Send welcome email via NATS
		emailPayload := map[string]interface{}{
			"type":     "welcome",
			"to":       user.Email,
			"username": user.Username,
		}
		_ = b.Publish("email.send", emailPayload)

		c.JSON(http.StatusOK, gin.H{
			"message":  "Email verified successfully! You can now log in.",
			"username": user.Username,
		})
	}
}

// ResendVerification resends the verification email
func ResendVerification(store db.Querier, b *broker.Broker) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email string `json:"email" binding:"required,email"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get user by email
		user, err := store.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil {
			// Don't reveal if email exists or not
			c.JSON(http.StatusOK, gin.H{
				"message": "If the email exists and is not verified, a new verification email has been sent.",
			})
			return
		}

		// Check if already verified
		if user.EmailVerified {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already verified"})
			return
		}

		// Generate new verification token
		token := generateToken()
		expiresAt := time.Now().Add(24 * time.Hour)

		// Update verification token
		_, err = store.UpdateVerificationToken(c.Request.Context(), db.UpdateVerificationTokenParams{
			VerificationToken:          pgtype.Text{String: token, Valid: true},
			VerificationTokenExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
			ID:                         user.ID,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification token"})
			return
		}

		// Send verification email via NATS
		emailPayload := map[string]interface{}{
			"type":     "verification",
			"to":       user.Email,
			"username": user.Username,
			"token":    token,
		}
		err = b.Publish("email.send", emailPayload)
		if err != nil {
			log.Printf("failed to publish verification email to NATS: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to queue verification email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Verification email sent successfully!",
		})
	}
}

// generateToken generates a secure random token
func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
