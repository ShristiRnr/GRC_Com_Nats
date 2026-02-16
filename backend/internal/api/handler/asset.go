package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/asset"

	"github.com/gin-gonic/gin"
)

type AssetHandler struct {
	service asset.AssetService
}

func NewAssetHandler(service asset.AssetService) *AssetHandler {
	return &AssetHandler{service: service}
}

func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var req asset.CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	newAsset, err := h.service.CreateAsset(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, newAsset)
}

func (h *AssetHandler) ListAssets(c *gin.Context) {
	assets, err := h.service.ListAssets(c.Request.Context())
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, assets)
}

func (h *AssetHandler) GetAsset(c *gin.Context) {
	id := c.Param("id")
	getAsset, err := h.service.GetAsset(c.Request.Context(), id)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, getAsset)
}

func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	var req asset.UpdateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedAsset, err := h.service.UpdateAsset(c.Request.Context(), id, req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, updatedAsset)
}

func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteAsset(c.Request.Context(), id); err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (h *AssetHandler) ListCategories(c *gin.Context) {
	categories, err := h.service.ListCategories(c.Request.Context())
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, categories)
}

func (h *AssetHandler) ListTypes(c *gin.Context) {
	types, err := h.service.ListTypes(c.Request.Context())
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, types)
}
