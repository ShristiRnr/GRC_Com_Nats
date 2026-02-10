package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/service"
)

func CreateTask(taskService service.TaskService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userPayload := middleware.GetUserContext(c)
		if userPayload == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req struct {
			Title   string                 `json:"title"`
			Payload map[string]interface{} `json:"payload"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := taskService.CreateTask(c.Request.Context(), userPayload, req.Title, req.Payload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create task"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{"message": "Task queued successfully"})
	}
}
