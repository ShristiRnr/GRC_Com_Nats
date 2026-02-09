package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
)

func CreateTask(db *pgxpool.Pool, b *broker.Broker) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Title   string                 `json:"title"`
			Payload map[string]interface{} `json:"payload"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Emit event to NATS
		err := b.Publish("tasks.created", req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to publish event"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{"message": "Task queued successfully"})
	}
}
