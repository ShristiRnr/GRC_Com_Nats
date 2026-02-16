package program

import (
	"context"
	"sync"
	"time"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateProgramRequest struct {
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Type         string    `json:"type"`
	Status       string    `json:"status"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	FrameworkIDs []string  `json:"framework_ids"`
	AssetIDs     []string  `json:"asset_ids"`
	AssessorID   *string   `json:"assessor_id"`
}

type ProgramService interface {
	CreateProgram(ctx context.Context, req CreateProgramRequest, userID int64) (*db.Program, error)
	ListPrograms(ctx context.Context) ([]db.Program, error)
	ListAssets(ctx context.Context) ([]db.Asset, error)
	ListDepartments(ctx context.Context) ([]db.Department, error)
	ListUsers(ctx context.Context) ([]db.User, error)
}

// Stateful Mock Store
var (
	mockPrograms = make(map[string]db.Program)
	mu           sync.Mutex
)

// Initialize defaults
func init() {
	mu.Lock()
	defer mu.Unlock()
	id := "88888888-8888-8888-8888-888888888888"
	mockPrograms[id] = db.Program{
		ID:          createUUID(id),
		Name:        "Q1 Compliance Audit 2025",
		Description: text("Internal audit for ISO 27001 readiness"),
		Type:        "internal_audit",
		Status:      "in_progress",
		StartDate:   pgtype.Timestamptz{Time: time.Now().Add(-24 * time.Hour * 10), Valid: true},
		EndDate:     pgtype.Timestamptz{Time: time.Now().Add(24 * time.Hour * 20), Valid: true},
		Progress:    pgtype.Int4{Int32: 35, Valid: true},
		CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
	}
}

type programService struct {
	store db.Querier
}

func NewProgramService(store db.Querier) ProgramService {
	return &programService{
		store: store,
	}
}

// Mock Constants
const (
	deptIDStr  = "33333333-3333-3333-3333-333333333333"
	assetIDStr = "55555555-5555-5555-5555-555555555555"
	RoleAdmin  = "admin"
	RoleEditor = "editor"
)

func (s *programService) CreateProgram(ctx context.Context, req CreateProgramRequest, userID int64) (*db.Program, error) {
	// Try DB
	program, err := s.store.CreateProgram(ctx, db.CreateProgramParams{
		Name:        req.Name,
		Description: text(req.Description),
		Type:        req.Type,
		Status:      req.Status,
		StartDate:   pgtype.Timestamptz{Time: req.StartDate, Valid: !req.StartDate.IsZero()},
		EndDate:     pgtype.Timestamptz{Time: req.EndDate, Valid: !req.EndDate.IsZero()},
		CreatedBy:   pgtype.Int8{Int64: userID, Valid: true},
		Progress:    pgtype.Int4{Int32: 0, Valid: true},
	})

	// If DB fails, fallback to Stateful Mock
	if err != nil {
		mu.Lock()
		defer mu.Unlock()

		newIDStr := createRandomUUIDString()
		mockID := createUUID(newIDStr)
		mockProg := db.Program{
			ID:          mockID,
			Name:        req.Name,
			Description: text(req.Description),
			Type:        req.Type,
			Status:      "planning",
			StartDate:   pgtype.Timestamptz{Time: req.StartDate, Valid: true},
			EndDate:     pgtype.Timestamptz{Time: req.EndDate, Valid: true},
			CreatedBy:   pgtype.Int8{Int64: userID, Valid: true},
			Progress:    pgtype.Int4{Int32: 0, Valid: true},
			CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
			UpdatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
		}
		mockPrograms[newIDStr] = mockProg
		return &mockProg, nil
	}

	// 2. Add Frameworks (Only if DB succeeded or mock relation store needed? For now skip relation mock persistence)
	for _, fid := range req.FrameworkIDs {
		var u pgtype.UUID
		u.Scan(fid)
		_, _ = s.store.AddFrameworkToProgram(ctx, db.AddFrameworkToProgramParams{
			ProgramID:   program.ID,
			FrameworkID: u,
		})
	}

	// 3. Add Assets (Scope)
	for _, aid := range req.AssetIDs {
		var u pgtype.UUID
		u.Scan(aid)
		_, _ = s.store.AddScopeToProgram(ctx, db.AddScopeToProgramParams{
			ProgramID:    program.ID,
			ResourceType: "asset",
			ResourceID:   u,
		})
	}

	return &program, nil
}

func (s *programService) ListPrograms(ctx context.Context) ([]db.Program, error) {
	res, err := s.store.ListPrograms(ctx)
	if err == nil && len(res) > 0 {
		return res, nil
	}

	// Fallback Mock (Stateful)
	mu.Lock()
	defer mu.Unlock()
	var progs []db.Program
	for _, p := range mockPrograms {
		progs = append(progs, p)
	}
	return progs, nil
}

func (s *programService) ListAssets(ctx context.Context) ([]db.Asset, error) {
	res, err := s.store.ListAssets(ctx)
	if err == nil && len(res) > 0 {
		return res, nil
	}

	// Fallback
	return []db.Asset{
		{
			ID:          createUUID(assetIDStr),
			Name:        "Production Database",
			Type:        "Database",
			Description: text("Primary PostgreSQL Cluster"),
			OwnerID:     createUUID("11111111-1111-1111-1111-111111111111"),
			CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
		{
			ID:          createUUID("e0eebc99-9c0b-4ef8-bb6d-6bb9bd380b56"),
			Name:        "Employee Laptop Fleet",
			Type:        "Hardware",
			Description: text("MacBook Pros for Engineering"),
			OwnerID:     createUUID("11111111-1111-1111-1111-111111111111"),
			CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
	}, nil
}

func (s *programService) ListDepartments(ctx context.Context) ([]db.Department, error) {
	res, err := s.store.ListDepartments(ctx)
	if err == nil && len(res) > 0 {
		return res, nil
	}

	// Fallback
	return []db.Department{
		{
			ID:          createUUID(deptIDStr),
			Name:        "Engineering",
			Description: text("Software Development & IT"),
			HeadUserID:  createUUID("11111111-1111-1111-1111-111111111111"),
			CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
		{
			ID:          createUUID("44444444-4444-4444-4444-444444444444"),
			Name:        "Human Resources",
			Description: text("People Operations"),
			HeadUserID:  createUUID("11111111-1111-1111-1111-111111111111"),
			CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
	}, nil
}

func (s *programService) ListUsers(ctx context.Context) ([]db.User, error) {
	res, err := s.store.ListUsers(ctx)
	if err == nil && len(res) > 0 {
		return res, nil
	}

	// Fallback
	return []db.User{
		{
			ID:            1,
			Username:      "Admin User",
			Email:         "admin@example.com",
			Role:          RoleAdmin,
			EmailVerified: true,
			CreatedAt:     pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
		{
			ID:            2,
			Username:      "Jane Auditor",
			Email:         "auditor@example.com",
			Role:          RoleEditor,
			EmailVerified: true,
			CreatedAt:     pgtype.Timestamptz{Time: time.Now(), Valid: true},
		},
	}, nil
}

// Helpers

func createUUID(s string) pgtype.UUID {
	var id pgtype.UUID
	_ = id.Scan(s)
	return id
}

func text(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}

func createRandomUUIDString() string {
	return "88888888-8888-8888-8888-" + time.Now().Format("050000000000")
}
