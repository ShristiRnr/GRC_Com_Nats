package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/policy"

	"github.com/gin-gonic/gin"
)

type PolicyHandler struct {
	service policy.PolicyService
}

func NewPolicyHandler(service policy.PolicyService) *PolicyHandler {
	return &PolicyHandler{service: service}
}

func (h *PolicyHandler) ListPolicies(c *gin.Context) {
	policies, err := h.service.ListPolicies(c.Request.Context())
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, policies)
}

func (h *PolicyHandler) CreatePolicy(c *gin.Context) {
	var req policy.CreatePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	p, err := h.service.CreatePolicy(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *PolicyHandler) GetPolicy(c *gin.Context) {
	id := c.Param("id")
	p, err := h.service.GetPolicy(c.Request.Context(), id)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PolicyHandler) DeletePolicy(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeletePolicy(c.Request.Context(), id); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Policy deleted"})
}

func (h *PolicyHandler) CreateClause(c *gin.Context) {
	var req policy.CreateClauseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clause, err := h.service.CreateClause(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, clause)
}

func (h *PolicyHandler) ListClauses(c *gin.Context) {
	id := c.Param("id")
	clauses, err := h.service.ListClauses(c.Request.Context(), id)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, clauses)
}
