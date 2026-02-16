package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/util"
	"grc-compil/backend/internal/config"
)

const (
	// These will be overridden by config values in the middleware
	DefaultAuthPayloadKey = "auth_payload"
	DefaultAccessTokenCookie = "access_token"
)

// AuthMiddleware creates a gin middleware for authorization
func AuthMiddleware(tokenMaker util.TokenMaker, store db.Querier, roleCache *util.AuthCache, cfg config.Config) gin.HandlerFunc {
	authPayloadKey := cfg.AuthPayloadKey
	if authPayloadKey == "" {
		authPayloadKey = DefaultAuthPayloadKey
	}
	accessTokenCookie := cfg.AccessTokenCookie
	if accessTokenCookie == "" {
		accessTokenCookie = DefaultAccessTokenCookie
	}

	return func(c *gin.Context) {
		// Try to get token from cookie first
		accessToken, err := c.Cookie(accessTokenCookie)
		if err != nil {
			// Fallback to Authorization header
			authorizationHeader := c.GetHeader("authorization")
			if len(authorizationHeader) == 0 {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header or cookie is not provided"})
				return
			}

			fields := strings.Fields(authorizationHeader)
			if len(fields) < 2 {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
				return
			}

			authorizationType := strings.ToLower(fields[0])
			if authorizationType != "bearer" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unsupported authorization type"})
				return
			}

			accessToken = fields[1]
		}

		payload, err := tokenMaker.VerifyToken(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired token"})
			return
		}

		// ROBUST VALIDATION: Ensure token payload contains all required security context
		if payload.UserID == "" || payload.OrgID == "" || payload.SessionID.String() == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: malformed token payload"})
			return
		}

		// STATEFUL CHECK: Verify the session exists and is active in the database
		var sessionID pgtype.UUID
		if err := sessionID.Scan(payload.SessionID.String()); err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid session identifier"})
			return
		}

		session, err := store.GetSession(c.Request.Context(), sessionID)
		if err != nil {
			fmt.Printf("Session lookup fail: %v from %s\n", err, c.ClientIP())
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
			return
		}

		if session.IsBlocked {
			fmt.Printf("Session blocked: %v from %s\n", sessionID, c.ClientIP())
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
			return
		}

		// SECURITY FIX: Fetch role from database, not from JWT
		// This prevents privilege escalation after role changes
		userIDInt, err := strconv.ParseInt(payload.UserID, 10, 64)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid user identifier"})
			return
		}

		var userRole string
		
		// Check cache first for performance
		if roleCache != nil {
			if cachedRole, found := roleCache.Get(userIDInt); found {
				userRole = cachedRole
			}
		}
		
		// Cache miss - fetch from database
		if userRole == "" {
			user, err := store.GetUser(c.Request.Context(), userIDInt)
			if err != nil {
				fmt.Printf("User lookup fail: %v from %s\n", err, c.ClientIP())
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: user not found"})
				return
			}
			
			userRole = user.Role
			
			// Populate cache
			if roleCache != nil {
				roleCache.Set(userIDInt, userRole)
			}
		}

		// RLS Context: Set session variables for Row Level Security
		c.Set("current_user_id", payload.UserID)
		c.Set("current_org_id", payload.OrgID)
		c.Set("current_user_role", userRole) // From DB, not JWT

		// Store config keys in context for other middleware/handlers to use if needed
		c.Set("auth_payload_key", authPayloadKey)

		// Inject into Request Context for DB Store/RLS
		ctx := util.InjectRLSContext(c.Request.Context(), payload.OrgID)
		c.Request = c.Request.WithContext(ctx)

		c.Set(authPayloadKey, payload)
		c.Next()
	}
}

// GetUserContext retrieves the user payload from the context
func GetUserContext(c *gin.Context) *util.TokenPayload {
	authPayloadKey := c.GetString("auth_payload_key")
	if authPayloadKey == "" {
		authPayloadKey = DefaultAuthPayloadKey
	}
	payload, exists := c.Get(authPayloadKey)
	if !exists {
		return nil
	}
	return payload.(*util.TokenPayload)
}

// GetSameSite converts string config to gin.SameSite
func GetSameSite(s string) http.SameSite {
	switch strings.ToLower(s) {
	case "lax":
		return http.SameSiteLaxMode
	case "strict":
		return http.SameSiteStrictMode
	case "none":
		return http.SameSiteNoneMode
	default:
		return http.SameSiteLaxMode
	}
}
