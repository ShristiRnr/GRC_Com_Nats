package handler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// HandleError logs the real error and returns a generic response to the client
func HandleError(c *gin.Context, err error) {
	if err == nil {
		return
	}

	errStr := err.Error()

	// Internal Logging for Auditing
	fmt.Printf("[INTERNAL ERROR] IP: %s | URL: %s | ERROR: %v\n", c.ClientIP(), c.Request.URL.Path, err)

	// Detect Postgres RLS / Permission Errors
	if strings.Contains(errStr, "42501") || strings.Contains(errStr, "permission denied") {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: permission denied"})
		return
	}

	// Detect Resource Not Found (Generic)
	if strings.Contains(errStr, "no rows in result set") {
		c.JSON(http.StatusNotFound, gin.H{"error": "resource not found"})
		return
	}

	// Default: Internal Server Error (Prevent schema/internal leakage)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
}

// HandleBindingError returns a generic validation error message to the client
func HandleBindingError(c *gin.Context, err error) {
	if err == nil {
		return
	}
	
	// Log the actual error for debugging
	fmt.Printf("[VALIDATION ERROR] IP: %s | URL: %s | ERROR: %v\n", c.ClientIP(), c.Request.URL.Path, err)
	
	c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request format or missing required fields"})
}
