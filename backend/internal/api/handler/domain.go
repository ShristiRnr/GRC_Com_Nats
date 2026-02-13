package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/domain"

	"github.com/gin-gonic/gin"
)

type DomainHandler struct {
	domainService domain.DomainService
}

func NewDomainHandler(domainService domain.DomainService) *DomainHandler {
	return &DomainHandler{domainService: domainService}
}

func (h *DomainHandler) ListDomains(c *gin.Context) {
	orgID := c.GetString("org_id")
	if orgID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	domains, err := h.domainService.ListDomains(c.Request.Context(), orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, domains)
}

func (h *DomainHandler) CreateDomain(c *gin.Context) {
	orgID := c.GetString("org_id")
	if orgID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	domain, err := h.domainService.CreateDomain(c.Request.Context(), orgID, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, domain)
}
