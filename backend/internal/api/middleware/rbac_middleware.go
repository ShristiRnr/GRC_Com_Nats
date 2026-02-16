package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/audit"
)

// RequirePermission checks if the authenticated user has the required permission
func RequirePermission(store db.Querier, audit audit.AuditService, permissionCode string) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload := GetUserContext(c)
		if payload == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: user context missing"})
			return
		}

		// SECURITY FIX: Get role from context (set by AuthMiddleware from DB)
		// DO NOT use payload.Role as it may be stale after role changes
		role := c.GetString("current_user_role")
		if role == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: no role assigned to user"})
			return
		}

		// Check permission for the user's role (from DB, not JWT)
		permissions, err := store.GetUserPermissions(c.Request.Context(), role)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: failed to verify permissions"})
			return
		}

		hasPermission := false
		for _, p := range permissions {
			if p == permissionCode {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			// LOG AUDIT EVENT: Unauthorized access attempt
			userID, _ := strconv.ParseInt(payload.UserID, 10, 64)
			audit.LogEvent(c.Request.Context(), &userID, &payload.OrgID, "auth.permission_denied", map[string]interface{}{
				"permission_required": permissionCode,
				"user_role":           role,
				"path":                c.Request.URL.Path,
			}, c.ClientIP(), c.Request.UserAgent())

			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: permission denied (" + permissionCode + ")"})
			return
		}

		c.Next()
	}
}
