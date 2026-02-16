package handler

import (
	"net/http"

	"grc-compil/backend/internal/service/task"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	service task.TaskService
}

func NewTaskHandler(service task.TaskService) *TaskHandler {
	return &TaskHandler{service: service}
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req task.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	newTask, err := h.service.CreateTask(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, newTask)
}

func (h *TaskHandler) ListTasks(c *gin.Context) {
	orgID := c.Query("org_id")
	if orgID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "org_id is required"})
		return
	}

	tasks, err := h.service.ListTasks(c.Request.Context(), orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id := c.Param("id")
	t, err := h.service.GetTask(c.Request.Context(), id)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TaskHandler) UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")
	var req task.UpdateTaskStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	t, err := h.service.UpdateTaskStatus(c.Request.Context(), id, req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TaskHandler) AssignActors(c *gin.Context) {
	id := c.Param("id")
	var req task.AssignActorsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	t, err := h.service.AssignActors(c.Request.Context(), id, req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, t)
}

func (h *TaskHandler) CreateEvidence(c *gin.Context) {
	var req task.CreateEvidenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	evidence, err := h.service.CreateEvidence(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, evidence)
}

func (h *TaskHandler) ListEvidenceByTask(c *gin.Context) {
	taskID := c.Param("id")
	evidence, err := h.service.ListEvidence(c.Request.Context(), taskID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, evidence)
}
