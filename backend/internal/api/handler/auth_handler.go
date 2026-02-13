package handler

import (
	"net/http"
	"strconv"

	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/service/auth"

	"github.com/gin-gonic/gin"
)

const (
	RefreshTokenCookie = "refresh_token"
)

func Login(service auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username   string `json:"username"`
			Identifier string `json:"identifier"`
			Password   string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Support both 'username' and 'identifier' fields for robustness
		loginID := req.Username
		if loginID == "" {
			loginID = req.Identifier
		}

		if loginID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "username or email is required"})
			return
		}

		res, err := service.Login(
			c.Request.Context(),
			loginID,
			req.Password,
			c.Request.UserAgent(),
			c.ClientIP(),
		)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Set Access Token Cookie
		c.SetCookie(
			middleware.AccessTokenCookie,
			res.AccessToken,
			int(res.AccessTokenPayload.ExpiresAt.Sub(res.AccessTokenPayload.IssuedAt.Time).Seconds()),
			"/", "", true, true,
		)

		// Set Refresh Token Cookie
		c.SetCookie(
			RefreshTokenCookie,
			res.RefreshToken,
			int(res.RefreshTokenPayload.ExpiresAt.Sub(res.RefreshTokenPayload.IssuedAt.Time).Seconds()),
			"/auth/refresh", "", true, true,
		)

		c.JSON(http.StatusOK, gin.H{
			"user": res.User,
		})
	}
}

func Refresh(service auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie(RefreshTokenCookie)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing refresh token"})
			return
		}

		res, err := service.Refresh(
			c.Request.Context(),
			refreshToken,
			c.Request.UserAgent(),
			c.ClientIP(),
		)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Set New Access Token Cookie
		c.SetCookie(
			middleware.AccessTokenCookie,
			res.AccessToken,
			int(res.AccessTokenPayload.ExpiresAt.Sub(res.AccessTokenPayload.IssuedAt.Time).Seconds()),
			"/", "", true, true,
		)

		c.JSON(http.StatusOK, gin.H{
			"user": res.User,
		})
	}
}

func Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.SetCookie(middleware.AccessTokenCookie, "", -1, "/", "", true, true)
		c.SetCookie(RefreshTokenCookie, "", -1, "/auth/refresh", "", true, true)
		c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
	}
}

func Me(service auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload := middleware.GetUserContext(c)
		if payload == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		userID, err := strconv.ParseInt(payload.UserID, 10, 64)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id in token"})
			return
		}

		user, err := service.Me(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		if !user.EmailVerified {
			c.JSON(http.StatusForbidden, gin.H{"error": "email not verified"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
