package router

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/api/handler"
	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	"grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service"
	"grc-compil/backend/internal/service/auth"
	"grc-compil/backend/internal/util"
)

func SetupRouter(dbPool *pgxpool.Pool, nats *broker.Broker, cfg config.Config) *gin.Engine {
	r := gin.Default()

	store := db.New(dbPool)
	tokenMaker := util.NewJWTMaker(cfg.TokenSecret)
	authService := auth.NewAuthService(store, tokenMaker, cfg.TokenDuration, cfg.RefreshTokenDuration)
	taskService := service.NewTaskService(store, nats)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "up",
		})
	})

	// Auth routes
	authGroup := r.Group("/auth")
	{
		// Setup routes (no auth required)
		authGroup.GET("/setup/status", handler.GetSetupStatus(store))
		authGroup.POST("/setup", handler.SetupSuperAdmin(store, authService))
		
		// Registration routes
		authGroup.POST("/signup", handler.Signup(store, nats))
		authGroup.GET("/verify/:token", handler.VerifyEmail(store, nats))
		authGroup.POST("/resend-verification", handler.ResendVerification(store, nats))
		
		// Login/logout routes
		authGroup.POST("/login", handler.Login(authService))
		authGroup.POST("/logout", handler.Logout())
		authGroup.POST("/refresh", handler.Refresh(authService))
		authGroup.GET("/me", middleware.AuthMiddleware(tokenMaker), handler.Me(authService))
	}

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(tokenMaker))
	{
		api.POST("/tasks", handler.CreateTask(taskService))
	}

	return r
}
