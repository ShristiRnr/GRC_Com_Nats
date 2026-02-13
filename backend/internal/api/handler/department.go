package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/department"

	"github.com/gin-gonic/gin"
)

type DepartmentHandler struct {
	departmentSvc department.DepartmentService
}

func NewDepartmentHandler(departmentSvc department.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{departmentSvc: departmentSvc}
}

func (h *DepartmentHandler) ListDepartments(c *gin.Context) {
	departments, err := h.departmentSvc.ListDepartments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, departments)
}

func (h *DepartmentHandler) GetDepartment(c *gin.Context) {
	id := c.Param("id")
	dept, err := h.departmentSvc.GetDepartment(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, dept)
}
