package handler

import (
	"net/http"
	"strconv"

	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/config"
	"grc-compil/backend/internal/service/auth"

	"github.com/gin-gonic/gin"
)

const (
	RefreshTokenCookie = "refresh_token"
)

type loginRequest struct {
	Username   string `json:"username"`
	Identifier string `json:"identifier"`
	Password   string `json:"password" binding:"required,min=6"`
}

func setTokenCookies(c *gin.Context, res *auth.LoginResponse, cfg config.Config) {
	accessTokenCookie := cfg.AccessTokenCookie
	if accessTokenCookie == "" {
		accessTokenCookie = middleware.DefaultAccessTokenCookie
	}
	refreshTokenCookie := cfg.RefreshTokenCookie
	if refreshTokenCookie == "" {
		refreshTokenCookie = RefreshTokenCookie
	}

	if res.AccessTokenPayload != nil {
		duration := int(res.AccessTokenPayload.ExpiresAt.Sub(res.AccessTokenPayload.IssuedAt.Time).Seconds())
		c.SetSameSite(middleware.GetSameSite(cfg.CookieSameSite))
		c.SetCookie(
			accessTokenCookie,
			res.AccessToken,
			duration,
			"/", "", cfg.CookieSecure, true,
		)
	}

	if res.RefreshTokenPayload != nil {
		duration := int(res.RefreshTokenPayload.ExpiresAt.Sub(res.RefreshTokenPayload.IssuedAt.Time).Seconds())
		c.SetCookie(
			refreshTokenCookie,
			res.RefreshToken,
			duration,
			"/auth/refresh", "", cfg.CookieSecure, true,
		)
	}
}

func Login(service auth.AuthService, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			HandleBindingError(c, err)
			return
		}

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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
			return
		}

		setTokenCookies(c, res, cfg)

		c.JSON(http.StatusOK, gin.H{
			"user": res.User,
		})
	}
}

func Refresh(service auth.AuthService, cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshTokenCookie := cfg.RefreshTokenCookie
		if refreshTokenCookie == "" {
			refreshTokenCookie = RefreshTokenCookie
		}
		refreshToken, err := c.Cookie(refreshTokenCookie)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired session"})
			return
		}

		res, err := service.Refresh(
			c.Request.Context(),
			refreshToken,
			c.Request.UserAgent(),
			c.ClientIP(),
		)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired session"})
			return
		}

		setTokenCookies(c, res, cfg)

		c.JSON(http.StatusOK, gin.H{
			"user": res.User,
		})
	}
}

func Logout(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		accessTokenCookie := cfg.AccessTokenCookie
		if accessTokenCookie == "" {
			accessTokenCookie = middleware.DefaultAccessTokenCookie
		}
		refreshTokenCookie := cfg.RefreshTokenCookie
		if refreshTokenCookie == "" {
			refreshTokenCookie = RefreshTokenCookie
		}

		c.SetCookie(accessTokenCookie, "", -1, "/", "", cfg.CookieSecure, true)
		c.SetCookie(refreshTokenCookie, "", -1, "/auth/refresh", "", cfg.CookieSecure, true)
		c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
	}
}

func Me(service auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload := middleware.GetUserContext(c)
		if payload == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
			return
		}

		userID, err := strconv.ParseInt(payload.UserID, 10, 64)
		if err != nil {
			HandleError(c, err)
			return
		}

		user, err := service.Me(c.Request.Context(), userID)
		if err != nil {
			// Generic 401 if user disappeared
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
			return
		}

		if !user.EmailVerified {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: email not verified"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
