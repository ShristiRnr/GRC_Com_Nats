package maintenance

import (
	"context"
	"log"
	"time"

	"grc-compil/backend/internal/db/sqlc"
)

// MaintenanceService handles background maintenance tasks
type MaintenanceService struct {
	store                db.Querier
	auditRetentionDays   int
	cleanupInterval      time.Duration
}

// NewMaintenanceService creates a new maintenance service
func NewMaintenanceService(store db.Querier, auditRetentionDays int) *MaintenanceService {
	return &MaintenanceService{
		store:              store,
		auditRetentionDays: auditRetentionDays,
		cleanupInterval:    24 * time.Hour, // Run once a day
	}
}

// Start begins the background maintenance loop
func (s *MaintenanceService) Start(ctx context.Context) {
	log.Printf("Starting background maintenance service (Retention: %d days)", s.auditRetentionDays)
	
	// Run immediately on start
	s.runMaintenance(ctx)

	ticker := time.NewTicker(s.cleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Stopping background maintenance service")
			return
		case <-ticker.C:
			s.runMaintenance(ctx)
		}
	}
}

func (s *MaintenanceService) runMaintenance(ctx context.Context) {
	log.Println("Running background maintenance tasks...")

	// 1. Delete expired sessions
	err := s.store.DeleteExpiredSessions(ctx)
	if err != nil {
		log.Printf("Error deleting expired sessions: %v", err)
	} else {
		log.Println("Expired sessions cleaned up successfully")
	}

	// 2. Delete old audit logs
	if s.auditRetentionDays > 0 {
		err = s.store.DeleteOldAuditLogs(ctx, int32(s.auditRetentionDays))
		if err != nil {
			log.Printf("Error deleting old audit logs: %v", err)
		} else {
			log.Printf("Audit logs older than %d days cleaned up successfully", s.auditRetentionDays)
		}
	}
}
