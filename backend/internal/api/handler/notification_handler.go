package handler

import (
	"net/http"
	"grc-compil/backend/internal/service/notification"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"strconv"
)

type NotificationHandler struct {
	service notification.NotificationService
}

func NewNotificationHandler(service notification.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

func (h *NotificationHandler) ListNotifications(c *gin.Context) {
	userIDStr := c.GetString("current_user_id")
	orgIDStr := c.GetString("current_org_id")

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid user id"})
		return
	}

	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid org id"})
		return
	}

	notifications, err := h.service.ListNotifications(c.Request.Context(), userID, orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, notifications)
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification id"})
		return
	}

	userIDStr := c.GetString("current_user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid user id"})
		return
	}

	notification, err := h.service.MarkAsRead(c.Request.Context(), id, userID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, notification)
}

func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userIDStr := c.GetString("current_user_id")
	orgIDStr := c.GetString("current_org_id")

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid user id"})
		return
	}

	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid org id"})
		return
	}

	count, err := h.service.GetUnreadCount(c.Request.Context(), userID, orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userIDStr := c.GetString("current_user_id")
	orgIDStr := c.GetString("current_org_id")

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid user id"})
		return
	}

	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: invalid org id"})
		return
	}

	err = h.service.MarkAllAsRead(c.Request.Context(), userID, orgID)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "all notifications marked as read"})
}
