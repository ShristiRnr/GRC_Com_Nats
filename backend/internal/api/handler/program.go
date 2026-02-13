package handler

import (
	"net/http"
	"strconv"

	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/service/program"

	"github.com/gin-gonic/gin"
)

type ProgramHandler struct {
	service program.ProgramService
}

func NewProgramHandler(service program.ProgramService) *ProgramHandler {
	return &ProgramHandler{service: service}
}

func (h *ProgramHandler) CreateProgram(c *gin.Context) {
	var req program.CreateProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := middleware.GetUserContext(c)
	var userID int64
	if payload == nil {
		// Fallback for development if no token - DUMMY TOKEN LOGIC
		userID = 1
	} else {
		userID, _ = strconv.ParseInt(payload.UserID, 10, 64)
	}

	prog, err := h.service.CreateProgram(c.Request.Context(), req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, prog)
}

func (h *ProgramHandler) ListPrograms(c *gin.Context) {
	progs, err := h.service.ListPrograms(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progs)
}

func (h *ProgramHandler) ListAssets(c *gin.Context) {
	assets, err := h.service.ListAssets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, assets)
}

func (h *ProgramHandler) ListDepartments(c *gin.Context) {
	depts, err := h.service.ListDepartments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, depts)
}

func (h *ProgramHandler) ListUsers(c *gin.Context) {
	users, err := h.service.ListUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}
