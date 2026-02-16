package router

import (
	"grc-compil/backend/internal/api/handler"
	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/asset"
	"grc-compil/backend/internal/service/audit"
	"grc-compil/backend/internal/service/auth"
	"grc-compil/backend/internal/service/category"
	"grc-compil/backend/internal/service/control"
	"grc-compil/backend/internal/service/department"
	"grc-compil/backend/internal/service/domain"
	"grc-compil/backend/internal/service/framework"
	"grc-compil/backend/internal/service/policy"
	"grc-compil/backend/internal/service/program"
	"grc-compil/backend/internal/service/notification"
	"grc-compil/backend/internal/service/risk"
	"grc-compil/backend/internal/service/task"
	"grc-compil/backend/internal/util"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func SetupRouter(store db.Querier, nats *broker.Broker, cfg config.Config) (*gin.Engine, error) {
	r := gin.Default()
	tokenMaker, err := util.NewJWTMaker(cfg.TokenSecret, cfg.JWTSigningAlgorithm, cfg.JWTIssuer, cfg.JWTAudience)
	if err != nil {
		return nil, fmt.Errorf("failed to create token maker: %w", err)
	}
	
	
	// Initialize services
	sqlStore, ok := store.(db.Store)
	if !ok {
		return nil, fmt.Errorf("store does not implement db.Store interface")
	}

	// Initialize NATS JetStream Streams
	if err := nats.InitStreams(); err != nil {
		return nil, fmt.Errorf("failed to initialize NATS JetStream: %w", err)
	}

	auditSvc := audit.NewAuditService(sqlStore)
	
	// Initialize role cache with configured TTL (default 2 minutes)
	var roleCache *util.AuthCache
	if cfg.AuthCacheTTL > 0 {
		roleCache = util.NewAuthCache(cfg.AuthCacheTTL)
	}

	// Initialize rate limiters with configured windows
	loginLimiter := util.NewIPRateLimiter(rate.Limit(float64(cfg.RateLimitLogin)/60.0), cfg.RateLimitLogin, cfg.RateLimitMaxSize)
	refreshLimiter := util.NewIPRateLimiter(rate.Limit(float64(cfg.RateLimitRefresh)/60.0), cfg.RateLimitRefresh, cfg.RateLimitMaxSize)
	signupLimiter := util.NewIPRateLimiter(rate.Limit(float64(cfg.RateLimitSignup)/60.0), cfg.RateLimitSignup, cfg.RateLimitMaxSize)
	
	// Start cleanup goroutines for rate limiters
	go loginLimiter.Cleanup(time.Hour)
	go refreshLimiter.Cleanup(time.Hour)
	go signupLimiter.Cleanup(time.Hour)
	
	authService := auth.NewAuthService(
		sqlStore, 
		tokenMaker, 
		auditSvc, 
		cfg.TokenDuration, 
		cfg.RefreshTokenDuration,
		cfg.MaxSessionsPerUser,
		cfg.BcryptCost,
		cfg.SuperAdminRole,
	)
	programSvc := program.NewProgramService(store)
	frameworkSvc := framework.NewFrameworkService(store)
	controlSvc := control.NewControlService(store)
	policySvc := policy.NewPolicyService(store)
	riskSvc := risk.NewRiskService(store)
	assetSvc := asset.NewAssetService(store)
	taskNewSvc := task.NewTaskService(store)
	categoryService := category.NewCategoryService(store)
	domainService := domain.NewDomainService(store)
	departmentService := department.NewDepartmentService(store)
	notificationSvc := notification.NewNotificationService(sqlStore)

	programHandler := handler.NewProgramHandler(programSvc)
	frameworkHandler := handler.NewFrameworkHandler(frameworkSvc)
	controlHandler := handler.NewControlHandler(controlSvc)
	policyHandler := handler.NewPolicyHandler(policySvc)
	riskHandler := handler.NewRiskHandler(riskSvc)
	assetHandler := handler.NewAssetHandler(assetSvc)
	taskHandler := handler.NewTaskHandler(taskNewSvc)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	domainHandler := handler.NewDomainHandler(domainService)
	departmentHandler := handler.NewDepartmentHandler(departmentService)
	notificationHandler := handler.NewNotificationHandler(notificationSvc)

	// Validate dependencies
	if store == nil { return nil, fmt.Errorf("SetupRouter: store is nil") }
	if authService == nil { return nil, fmt.Errorf("SetupRouter: authService is nil") }
	if programHandler == nil { return nil, fmt.Errorf("SetupRouter: programHandler is nil") }
	if frameworkHandler == nil { return nil, fmt.Errorf("SetupRouter: frameworkHandler is nil") }
	if controlHandler == nil { return nil, fmt.Errorf("SetupRouter: controlHandler is nil") }
	if policyHandler == nil { return nil, fmt.Errorf("SetupRouter: policyHandler is nil") }
	if riskHandler == nil { return nil, fmt.Errorf("SetupRouter: riskHandler is nil") }
	if assetHandler == nil { return nil, fmt.Errorf("SetupRouter: assetHandler is nil") }
	if taskHandler == nil { return nil, fmt.Errorf("SetupRouter: taskHandler is nil") }
	if departmentHandler == nil { return nil, fmt.Errorf("SetupRouter: departmentHandler is nil") }

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowed := false
		for _, o := range cfg.AllowOrigins {
			if o == origin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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
		authGroup.POST("/setup", handler.SetupSuperAdmin(store, authService, nats, cfg))

		// Registration routes
		authGroup.POST("/signup", middleware.RateLimiterMiddleware(signupLimiter), handler.Signup(store, nats, cfg))
		authGroup.GET("/verify/:token", handler.VerifyEmail(store, nats, cfg))
		authGroup.POST("/resend-verification", handler.ResendVerification(store, nats, cfg))

		// Login/logout routes
		authGroup.POST("/login", middleware.RateLimiterMiddleware(loginLimiter), handler.Login(authService, cfg))
		authGroup.POST("/logout", handler.Logout(cfg))
		authGroup.POST("/refresh", middleware.RateLimiterMiddleware(refreshLimiter), handler.Refresh(authService, cfg))
		authGroup.GET("/me", middleware.AuthMiddleware(tokenMaker, store, roleCache, cfg), handler.Me(authService))
	}

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(tokenMaker, store, roleCache, cfg))
	{
		// Task Routes
		tasks := api.Group("/tasks")
		{
			tasks.POST("", middleware.RequirePermission(store, auditSvc, "tasks.write"), taskHandler.CreateTask)
			tasks.GET("", middleware.RequirePermission(store, auditSvc, "tasks.read"), taskHandler.ListTasks)
			tasks.GET("/:id", middleware.RequirePermission(store, auditSvc, "tasks.read"), taskHandler.GetTask)
			tasks.PATCH("/:id/status", middleware.RequirePermission(store, auditSvc, "tasks.write"), taskHandler.UpdateTaskStatus)
			tasks.PATCH("/:id/actors", middleware.RequirePermission(store, auditSvc, "tasks.write"), taskHandler.AssignActors)
			tasks.POST("/:id/evidence", middleware.RequirePermission(store, auditSvc, "tasks.write"), taskHandler.CreateEvidence)
			tasks.GET("/:id/evidence", middleware.RequirePermission(store, auditSvc, "tasks.read"), taskHandler.ListEvidenceByTask)
		}

		// Program Routes
		programs := api.Group("/programs")
		{
			programs.POST("", middleware.RequirePermission(store, auditSvc, "frameworks.write"), programHandler.CreateProgram)
			programs.GET("", middleware.RequirePermission(store, auditSvc, "frameworks.read"), programHandler.ListPrograms)
		}

		// Framework Routes
		frameworks := api.Group("/frameworks")
		{
			frameworks.GET("", middleware.RequirePermission(store, auditSvc, "frameworks.read"), frameworkHandler.ListFrameworks)
			frameworks.POST("", middleware.RequirePermission(store, auditSvc, "frameworks.write"), frameworkHandler.CreateFramework)
			frameworks.GET("/:id", middleware.RequirePermission(store, auditSvc, "frameworks.read"), frameworkHandler.GetFramework)
			frameworks.PUT("/:id", middleware.RequirePermission(store, auditSvc, "frameworks.write"), frameworkHandler.UpdateFramework)
			frameworks.DELETE("/:id", middleware.RequirePermission(store, auditSvc, "frameworks.delete"), frameworkHandler.DeleteFramework)
			frameworks.PATCH("/:id/status", middleware.RequirePermission(store, auditSvc, "frameworks.write"), frameworkHandler.UpdateFrameworkStatus)

			// Control Mapping
			frameworks.GET("/:id/controls", middleware.RequirePermission(store, auditSvc, "controls.read"), controlHandler.ListFrameworkControls)
			frameworks.GET("/:id/available-controls", middleware.RequirePermission(store, auditSvc, "controls.read"), controlHandler.ListAvailableControls)
			frameworks.POST("/:id/map", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.MapControl)
			frameworks.POST("/:id/unmap", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.UnmapControl)
		}

		// Controls CRUD
		controls := api.Group("/controls")
		{
			controls.POST("", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.CreateControl)
			controls.GET("", middleware.RequirePermission(store, auditSvc, "controls.read"), controlHandler.ListControls)
			controls.GET("/stats", middleware.RequirePermission(store, auditSvc, "controls.read"), controlHandler.GetControlStats)
			controls.GET("/:id", middleware.RequirePermission(store, auditSvc, "controls.read"), controlHandler.GetControl)
			controls.PUT("/:id", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.UpdateControl)
			controls.DELETE("/:id", middleware.RequirePermission(store, auditSvc, "controls.delete"), controlHandler.DeleteControl)
			controls.POST("/import", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.ImportControls)
			controls.POST("/:id/assets", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.LinkAsset)
			controls.DELETE("/:id/assets/:assetId", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.UnlinkAsset)
			controls.POST("/:id/risks", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.LinkRisk)
			controls.DELETE("/:id/risks/:riskId", middleware.RequirePermission(store, auditSvc, "controls.write"), controlHandler.UnlinkRisk)
		}

		// Category Routes
		categories := api.Group("/categories")
		{
			categories.GET("", middleware.RequirePermission(store, auditSvc, "controls.read"), categoryHandler.ListCategories)
			categories.POST("", middleware.RequirePermission(store, auditSvc, "controls.write"), categoryHandler.CreateCategory)
		}

		// Domain Routes
		domains := api.Group("/domains")
		{
			domains.GET("", middleware.RequirePermission(store, auditSvc, "controls.read"), domainHandler.ListDomains)
			domains.POST("", middleware.RequirePermission(store, auditSvc, "controls.write"), domainHandler.CreateDomain)
		}

		// Department Routes
		departments := api.Group("/departments")
		{
			departments.GET("", middleware.RequirePermission(store, auditSvc, "departments.read"), departmentHandler.ListDepartments)
			departments.GET("/:id", middleware.RequirePermission(store, auditSvc, "departments.read"), departmentHandler.GetDepartment)
		}

		// Asset Routes
		assets := api.Group("/assets")
		{
			assets.GET("", middleware.RequirePermission(store, auditSvc, "assets.read"), assetHandler.ListAssets)
			assets.POST("", middleware.RequirePermission(store, auditSvc, "assets.write"), assetHandler.CreateAsset)
			assets.GET("/:id", middleware.RequirePermission(store, auditSvc, "assets.read"), assetHandler.GetAsset)
			assets.PATCH("/:id", middleware.RequirePermission(store, auditSvc, "assets.write"), assetHandler.UpdateAsset)
			assets.DELETE("/:id", middleware.RequirePermission(store, auditSvc, "assets.delete"), assetHandler.DeleteAsset)
			assets.GET("/categories", middleware.RequirePermission(store, auditSvc, "assets.read"), assetHandler.ListCategories)
			assets.GET("/types", middleware.RequirePermission(store, auditSvc, "assets.read"), assetHandler.ListTypes)
		}

		// Risk Routes
		risks := api.Group("/risks")
		{
			risks.GET("", middleware.RequirePermission(store, auditSvc, "risks.read"), riskHandler.ListRisks)
			risks.POST("", middleware.RequirePermission(store, auditSvc, "risks.write"), riskHandler.CreateRisk)
			risks.GET("/:id", middleware.RequirePermission(store, auditSvc, "risks.read"), riskHandler.GetRisk)
			risks.PATCH("/:id", middleware.RequirePermission(store, auditSvc, "risks.write"), riskHandler.UpdateRisk)
			risks.DELETE("/:id", middleware.RequirePermission(store, auditSvc, "risks.delete"), riskHandler.DeleteRisk)
			risks.POST("/:id/controls", middleware.RequirePermission(store, auditSvc, "controls.write"), riskHandler.LinkControl)
			risks.GET("/:id/controls", middleware.RequirePermission(store, auditSvc, "controls.read"), riskHandler.ListRiskControls)
		}

		// Policy Routes
		policies := api.Group("/policies")
		{
			policies.GET("", middleware.RequirePermission(store, auditSvc, "policies.read"), policyHandler.ListPolicies)
			policies.POST("", middleware.RequirePermission(store, auditSvc, "policies.write"), policyHandler.CreatePolicy)
			policies.GET("/:id", middleware.RequirePermission(store, auditSvc, "policies.read"), policyHandler.GetPolicy)
			policies.DELETE("/:id", middleware.RequirePermission(store, auditSvc, "policies.delete"), policyHandler.DeletePolicy)
			policies.POST("/:id/clauses", middleware.RequirePermission(store, auditSvc, "policies.write"), policyHandler.CreateClause)
			policies.GET("/:id/clauses", middleware.RequirePermission(store, auditSvc, "policies.read"), policyHandler.ListClauses)
		}

		// User Management
		users := api.Group("/users")
		{
			users.GET("", middleware.RequirePermission(store, auditSvc, "users.read"), programHandler.ListUsers)
		}

		// Notification Routes
		notifications := api.Group("/notifications")
		{
			notifications.GET("", notificationHandler.ListNotifications)
			notifications.GET("/unread-count", notificationHandler.GetUnreadCount)
			notifications.PATCH("/mark-all-read", notificationHandler.MarkAllAsRead)
			notifications.PATCH("/:id/read", notificationHandler.MarkAsRead)
		}
	}

	return r, nil
}
