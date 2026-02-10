package service

import (
	"context"
	"fmt"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/util"
)

type TaskService interface {
	CreateTask(ctx context.Context, payload *util.TokenPayload, title string, taskPayload map[string]interface{}) error
}

type taskService struct {
	store  db.Querier
	broker *broker.Broker
}

func NewTaskService(store db.Querier, b *broker.Broker) TaskService {
	return &taskService{
		store:  store,
		broker: b,
	}
}

func (s *taskService) CreateTask(ctx context.Context, payload *util.TokenPayload, title string, taskPayload map[string]interface{}) error {
	// Super Admin Bypass Logic
	orgID := payload.OrgID
	if payload.Role == "super_admin" {
		// As a super admin, we might want to specify which org we are acting on
		// For now, let's assume they act on their own unless specified otherwise
		// In a real scenario, we might allow them to override orgID from the request
		fmt.Printf("Super Admin bypass active for user: %s\n", payload.UserID)
	}

	eventPayload := map[string]interface{}{
		"title":   title,
		"payload": taskPayload,
		"org_id":  orgID,
	}

	return s.broker.Publish("tasks.created", eventPayload)
}
