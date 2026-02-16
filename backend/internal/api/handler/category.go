package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/category"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService category.CategoryService
}

func NewCategoryHandler(categoryService category.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

func (h *CategoryHandler) ListCategories(c *gin.Context) {
	orgID := c.GetString("org_id")
	if orgID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
		return
	}

	categories, err := h.categoryService.ListCategories(c.Request.Context(), orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, categories)
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	orgID := c.GetString("org_id")
	if orgID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid or expired session"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	category, err := h.categoryService.CreateCategory(c.Request.Context(), orgID, req.Name)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, category)
}
