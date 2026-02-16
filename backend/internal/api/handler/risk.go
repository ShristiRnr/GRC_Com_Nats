package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/risk"

	"github.com/gin-gonic/gin"
)

type RiskHandler struct {
	service risk.RiskService
}

func NewRiskHandler(service risk.RiskService) *RiskHandler {
	return &RiskHandler{service: service}
}

func (h *RiskHandler) CreateRisk(c *gin.Context) {
	var req risk.CreateRiskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	risk, err := h.service.CreateRisk(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, risk)
}

func (h *RiskHandler) ListRisks(c *gin.Context) {
	orgID := c.Query("org_id")
	if orgID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "org_id is required"})
		return
	}

	risks, err := h.service.ListRisks(c.Request.Context(), orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, risks)
}

func (h *RiskHandler) GetRisk(c *gin.Context) {
	id := c.Param("id")
	risk, err := h.service.GetRisk(c.Request.Context(), id)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, risk)
}

func (h *RiskHandler) UpdateRisk(c *gin.Context) {
	id := c.Param("id")
	var req risk.UpdateRiskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	risk, err := h.service.UpdateRisk(c.Request.Context(), id, req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, risk)
}

func (h *RiskHandler) DeleteRisk(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteRisk(c.Request.Context(), id); err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (h *RiskHandler) LinkControl(c *gin.Context) {
	var req risk.LinkControlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.LinkControl(c.Request.Context(), req); err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *RiskHandler) ListRiskControls(c *gin.Context) {
	riskID := c.Param("id")
	controls, err := h.service.ListRiskControls(c.Request.Context(), riskID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, controls)
}
