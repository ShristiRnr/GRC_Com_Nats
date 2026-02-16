package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"grc-compil/backend/internal/util"
)

// RateLimiterMiddleware creates a middleware for rate limiting
func RateLimiterMiddleware(limiter *util.IPRateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		l := limiter.GetLimiter(ip)
		if !l.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests, please try again later",
			})
			return
		}
		c.Next()
	}
}
