package audit

import (
	"context"
	"encoding/json"
	"log"

	"github.com/jackc/pgx/v5/pgtype"
	db "grc-compil/backend/internal/db/sqlc"
)

type AuditService interface {
	LogEvent(ctx context.Context, userID *int64, orgID *string, eventType string, data map[string]interface{}, ip, userAgent string)
}

type auditService struct {
	store db.Querier
}

func NewAuditService(store db.Querier) AuditService {
	return &auditService{store: store}
}

func (s *auditService) LogEvent(ctx context.Context, userID *int64, orgIDStr *string, eventType string, data map[string]interface{}, ip, userAgent string) {
	// We run this in a goroutine or handle it gracefully to not block the main request
	// For high stability, we should use a worker pattern or buffer, but for now, simple insert is fine.
	
	eventData, err := json.Marshal(data)
	if err != nil {
		eventData = []byte("{}")
	}

	params := db.CreateAuditLogParams{
		EventType: eventType,
		EventData: eventData,
		IpAddress: pgtype.Text{String: ip, Valid: ip != ""},
		UserAgent: pgtype.Text{String: userAgent, Valid: userAgent != ""},
	}

	if userID != nil {
		params.UserID = pgtype.Int8{Int64: *userID, Valid: true}
	}

	if orgIDStr != nil && *orgIDStr != "" {
		var orgID pgtype.UUID
		if err := orgID.Scan(*orgIDStr); err == nil {
			params.OrgID = orgID
		}
	}

	_, err = s.store.CreateAuditLog(ctx, params)
	if err != nil {
		// Just log the error, don't break the main flow
		log.Printf("Failed to create audit log: %v", err)
	}
}
