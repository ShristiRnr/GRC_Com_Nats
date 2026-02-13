package framework

import (
	"context"
	"fmt"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateFrameworkRequest struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Version     string      `json:"version"`
	Status      string      `json:"status"`
	OrgID       pgtype.UUID `json:"org_id"`
}

type UpdateFrameworkRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

type UpdateControlRequest struct {
	Code        string `json:"code"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

type CreateControlRequest struct {
	Code        string      `json:"code"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Category    string      `json:"category"`
	OrgID       pgtype.UUID `json:"org_id"`
	FrameworkID string      `json:"framework_id"` // Optional
}

type ControlStats struct {
	TotalControls    int64 `json:"total_controls"`
	ActiveControls   int64 `json:"active_controls"`
	DraftControls    int64 `json:"draft_controls"`
	MappedControls   int64 `json:"mapped_controls"`
	UniqueCategories int64 `json:"unique_categories"`
}

type ImportControlDTO struct {
	Code        string
	Title       string
	Description string
	Category    string
	Frameworks  []string
}

type ImportStats struct {
	Processed int      `json:"processed"`
	Failed    int      `json:"failed"`
	Warnings  []string `json:"warnings"`
	Errors    []string `json:"errors"`
}

type ControlResponse struct {
	ID            pgtype.UUID        `json:"id"`
	Code          string             `json:"code"`
	Title         string             `json:"title"`
	Description   pgtype.Text        `json:"description"`
	Category      pgtype.Text        `json:"category"`
	Status        string             `json:"status"` // derived
	FrameworkName string             `json:"framework_name"`
	CreatedAt     pgtype.Timestamptz `json:"created_at"`
	UpdatedAt     pgtype.Timestamptz `json:"updated_at"`
	OrgID         pgtype.UUID        `json:"org_id"`
}

type FrameworkResponse struct {
	ID           pgtype.UUID        `json:"id"`
	Name         string             `json:"name"`
	Description  string             `json:"description"`
	Version      string             `json:"version"`
	Status       string             `json:"status"`
	ControlCount int64              `json:"control_count"`
	Progress     int32              `json:"progress"`
	CreatedAt    pgtype.Timestamptz `json:"created_at"`
	UpdatedAt    pgtype.Timestamptz `json:"updated_at"`
	OrgID        pgtype.UUID        `json:"org_id"`
}

type FrameworkService interface {
	CreateFramework(ctx context.Context, req CreateFrameworkRequest) (*db.Framework, error)
	GetFramework(ctx context.Context, id string, orgID string) (*FrameworkResponse, error)
	ListFrameworks(ctx context.Context, orgID string) ([]FrameworkResponse, error)
	UpdateFramework(ctx context.Context, id string, orgID string, req UpdateFrameworkRequest) (*db.Framework, error)
	DeleteFramework(ctx context.Context, id string, orgID string) error
	UpdateFrameworkStatus(ctx context.Context, id string, orgID string, status string) (*db.Framework, error)
}

type frameworkService struct {
	store db.Querier
}

func NewFrameworkService(store db.Querier) FrameworkService {
	return &frameworkService{
		store: store,
	}
}

func (s *frameworkService) CreateFramework(ctx context.Context, req CreateFrameworkRequest) (*db.Framework, error) {
	fw, err := s.store.CreateFramework(ctx, db.CreateFrameworkParams{
		Name:        req.Name,
		Description: text(req.Description),
		Version:     text(req.Version),
		Status:      req.Status,
		OrgID:       req.OrgID,
	})
	if err != nil {
		return nil, err
	}
	return &fw, nil
}

func (s *frameworkService) GetFramework(ctx context.Context, id string, orgID string) (*FrameworkResponse, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, fmt.Errorf("invalid framework id: %w", err)
	}

	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, fmt.Errorf("invalid organization id: %w", err)
	}

	row, err := s.store.GetFramework(ctx, db.GetFrameworkParams{
		ID:    uid,
		OrgID: oid,
	})
	if err != nil {
		return nil, err
	}

	return &FrameworkResponse{
		ID:           row.ID,
		Name:         row.Name,
		Description:  row.Description.String,
		Version:      row.Version.String,
		Status:       row.Status,
		ControlCount: row.ControlCount_2,
		Progress:     toInt32(row.Progress),
		CreatedAt:    row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
		OrgID:        row.OrgID,
	}, nil
}

func (s *frameworkService) ListFrameworks(ctx context.Context, orgID string) ([]FrameworkResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}

	rows, err := s.store.ListFrameworks(ctx, oid)
	if err != nil {
		return nil, err
	}

	res := make([]FrameworkResponse, 0, len(rows))
	for _, row := range rows {
		res = append(res, FrameworkResponse{
			ID:           row.ID,
			Name:         row.Name,
			Description:  row.Description.String,
			Version:      row.Version.String,
			Status:       row.Status,
			ControlCount: row.ControlCount_2,
			Progress:     toInt32(row.Progress),
			CreatedAt:    row.CreatedAt,
			UpdatedAt:    row.UpdatedAt,
			OrgID:        row.OrgID,
		})
	}
	return res, nil
}

func (s *frameworkService) UpdateFramework(ctx context.Context, id string, orgID string, req UpdateFrameworkRequest) (*db.Framework, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, err
	}

	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}

	fw, err := s.store.UpdateFramework(ctx, db.UpdateFrameworkParams{
		ID:          uid,
		Name:        req.Name,
		Description: text(req.Description),
		Version:     text(req.Version),
		OrgID:       oid,
	})
	if err != nil {
		return nil, err
	}
	return &fw, nil
}

func (s *frameworkService) DeleteFramework(ctx context.Context, id string, orgID string) error {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return err
	}

	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return err
	}

	return s.store.DeleteFramework(ctx, db.DeleteFrameworkParams{
		ID:    uid,
		OrgID: oid,
	})
}

func (s *frameworkService) UpdateFrameworkStatus(ctx context.Context, id string, orgID string, status string) (*db.Framework, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, err
	}

	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}

	fw, err := s.store.UpdateFrameworkStatus(ctx, db.UpdateFrameworkStatusParams{
		ID:     uid,
		Status: status,
		OrgID:  oid,
	})
	if err != nil {
		return nil, err
	}
	return &fw, nil
}

// Helpers
func toInt32(v interface{}) int32 {
	if v == nil {
		return 0
	}
	switch val := v.(type) {
	case float64:
		return int32(val)
	case int64:
		return int32(val)
	case int32:
		return val
	case float32:
		return int32(val)
	default:
		return 0
	}
}

func text(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}
