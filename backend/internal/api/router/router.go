package router

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
)

func SetupRouter(db *pgxpool.Pool, nats *broker.Broker) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "up",
		})
	})

	api := r.Group("/api")
	{
		api.POST("/tasks", handler.CreateTask(db, nats))
	}

	return r
}
