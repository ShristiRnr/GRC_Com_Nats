package handler

import (
	"net/http"

	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/service/framework"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

type FrameworkHandler struct {
	service framework.FrameworkService
}

func NewFrameworkHandler(service framework.FrameworkService) *FrameworkHandler {
	return &FrameworkHandler{service: service}
}

func (h *FrameworkHandler) CreateFramework(c *gin.Context) {
	payload := middleware.GetUserContext(c)
	var orgID pgtype.UUID
	orgID.Scan(payload.OrgID)

	var req framework.CreateFrameworkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}
	req.OrgID = orgID

	fw, err := h.service.CreateFramework(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, fw)
}

func (h *FrameworkHandler) GetFramework(c *gin.Context) {
	id := c.Param("id")
	payload := middleware.GetUserContext(c)

	fw, err := h.service.GetFramework(c.Request.Context(), id, payload.OrgID)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, fw)
}

func (h *FrameworkHandler) ListFrameworks(c *gin.Context) {
	payload := middleware.GetUserContext(c)
	fws, err := h.service.ListFrameworks(c.Request.Context(), payload.OrgID)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, fws)
}

func (h *FrameworkHandler) UpdateFramework(c *gin.Context) {
	id := c.Param("id")
	payload := middleware.GetUserContext(c)
	var req framework.UpdateFrameworkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	fw, err := h.service.UpdateFramework(c.Request.Context(), id, payload.OrgID, req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, fw)
}

func (h *FrameworkHandler) DeleteFramework(c *gin.Context) {
	id := c.Param("id")
	payload := middleware.GetUserContext(c)
	if err := h.service.DeleteFramework(c.Request.Context(), id, payload.OrgID); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "framework deleted successfully"})
}

func (h *FrameworkHandler) UpdateFrameworkStatus(c *gin.Context) {
	id := c.Param("id")
	payload := middleware.GetUserContext(c)
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	fw, err := h.service.UpdateFrameworkStatus(c.Request.Context(), id, payload.OrgID, req.Status)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, fw)
}
