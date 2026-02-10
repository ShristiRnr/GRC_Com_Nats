package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"grc-compil/backend/internal/util"
)

const (
	AuthPayloadKey = "auth_payload"
	AccessTokenCookie = "access_token"
)

// AuthMiddleware creates a gin middleware for authorization
func AuthMiddleware(tokenMaker util.TokenMaker) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get token from cookie first
		accessToken, err := c.Cookie(AccessTokenCookie)
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
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Set(AuthPayloadKey, payload)
		c.Next()
	}
}

// GetUserContext retrieves the user payload from the context
func GetUserContext(c *gin.Context) *util.TokenPayload {
	payload, exists := c.Get(AuthPayloadKey)
	if !exists {
		return nil
	}
	return payload.(*util.TokenPayload)
}
