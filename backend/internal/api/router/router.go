package router

import (
	"grc-compil/backend/internal/api/handler"
	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/asset"
	"grc-compil/backend/internal/service/auth"
	"grc-compil/backend/internal/service/category"
	"grc-compil/backend/internal/service/control"
	"grc-compil/backend/internal/service/department"
	"grc-compil/backend/internal/service/domain"
	"grc-compil/backend/internal/service/framework"
	"grc-compil/backend/internal/service/policy"
	"grc-compil/backend/internal/service/program"
	"grc-compil/backend/internal/service/risk"
	"grc-compil/backend/internal/service/task"
	"grc-compil/backend/internal/util"

	"github.com/gin-gonic/gin"
)

func SetupRouter(store db.Querier, nats *broker.Broker, cfg config.Config) *gin.Engine {
	r := gin.Default()
	tokenMaker := util.NewJWTMaker(cfg.TokenSecret)
	authService := auth.NewAuthService(store, tokenMaker, cfg.TokenDuration, cfg.RefreshTokenDuration)
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
		authGroup.POST("/setup", handler.SetupSuperAdmin(store, authService, nats))

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
		// Task Routes (v1 Parity)
		api.POST("/tasks", taskHandler.CreateTask)
		api.GET("/tasks", taskHandler.ListTasks)
		api.GET("/tasks/:id", taskHandler.GetTask)
		api.PATCH("/tasks/:id/status", taskHandler.UpdateTaskStatus)
		api.PATCH("/tasks/:id/actors", taskHandler.AssignActors)
		api.POST("/tasks/:id/evidence", taskHandler.CreateEvidence)
		api.GET("/tasks/:id/evidence", taskHandler.ListEvidenceByTask)

		// Program Routes
		api.POST("/programs", programHandler.CreateProgram)
		api.GET("/programs", programHandler.ListPrograms)
		// Framework Routes
		api.GET("/frameworks", frameworkHandler.ListFrameworks)
		api.POST("/frameworks", frameworkHandler.CreateFramework)
		api.GET("/frameworks/:id", frameworkHandler.GetFramework)
		api.PUT("/frameworks/:id", frameworkHandler.UpdateFramework)
		api.DELETE("/frameworks/:id", frameworkHandler.DeleteFramework)
		api.PATCH("/frameworks/:id/status", frameworkHandler.UpdateFrameworkStatus)

		// Control Mapping
		api.GET("/frameworks/:id/controls", controlHandler.ListFrameworkControls)
		api.GET("/frameworks/:id/available-controls", controlHandler.ListAvailableControls)
		api.POST("/frameworks/:id/map", controlHandler.MapControl)
		api.POST("/frameworks/:id/unmap", controlHandler.UnmapControl)

		// Controls CRUD
		api.POST("/controls", controlHandler.CreateControl)
		api.GET("/controls", controlHandler.ListControls)
		api.GET("/controls/stats", controlHandler.GetControlStats)
		api.GET("/controls/:id", controlHandler.GetControl)
		api.PUT("/controls/:id", controlHandler.UpdateControl)
		api.DELETE("/controls/:id", controlHandler.DeleteControl)
		api.POST("/controls/import", controlHandler.ImportControls)
		api.POST("/controls/:id/assets", controlHandler.LinkAsset)
		api.DELETE("/controls/:id/assets/:assetId", controlHandler.UnlinkAsset)
		api.POST("/controls/:id/risks", controlHandler.LinkRisk)
		api.DELETE("/controls/:id/risks/:riskId", controlHandler.UnlinkRisk)

		// Category Routes
		categories := api.Group("/categories")
		{
			categories.GET("", categoryHandler.ListCategories)
			categories.POST("", categoryHandler.CreateCategory)
		}

		// Domain Routes
		domains := api.Group("/domains")
		{
			domains.GET("", domainHandler.ListDomains)
			domains.POST("", domainHandler.CreateDomain)
		}

		// Department Routes
		departments := api.Group("/departments")
		{
			departments.GET("", departmentHandler.ListDepartments)
			departments.GET("/:id", departmentHandler.GetDepartment)
		}

		// Asset Routes
		api.GET("/assets", assetHandler.ListAssets)
		api.POST("/assets", assetHandler.CreateAsset)
		api.GET("/assets/:id", assetHandler.GetAsset)
		api.PATCH("/assets/:id", assetHandler.UpdateAsset)
		api.DELETE("/assets/:id", assetHandler.DeleteAsset)
		api.GET("/asset-categories", assetHandler.ListCategories)
		api.GET("/asset-types", assetHandler.ListTypes)

		api.GET("/departments", programHandler.ListDepartments)
		api.GET("/users", programHandler.ListUsers)

		// Risk Routes
		api.GET("/risks", riskHandler.ListRisks)
		api.POST("/risks", riskHandler.CreateRisk)
		api.GET("/risks/:id", riskHandler.GetRisk)
		api.PATCH("/risks/:id", riskHandler.UpdateRisk)
		api.DELETE("/risks/:id", riskHandler.DeleteRisk)
		api.POST("/risks/:id/controls", riskHandler.LinkControl)
		api.GET("/risks/:id/controls", riskHandler.ListRiskControls)

		// Policy Routes
		api.GET("/policies", policyHandler.ListPolicies)
		api.POST("/policies", policyHandler.CreatePolicy)
		api.GET("/policies/:id", policyHandler.GetPolicy)
		api.DELETE("/policies/:id", policyHandler.DeletePolicy)
		api.POST("/policies/:id/clauses", policyHandler.CreateClause)
		api.GET("/policies/:id/clauses", policyHandler.ListClauses)
	}

	return r
}
