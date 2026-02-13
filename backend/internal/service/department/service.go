package department

import (
	"context"
	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type DepartmentResponse struct {
	ID          pgtype.UUID `json:"id"`
	Name        string      `json:"name"`
	Description pgtype.Text `json:"description"`
}

type DepartmentService interface {
	ListDepartments(ctx context.Context) ([]DepartmentResponse, error)
	GetDepartment(ctx context.Context, id string) (*DepartmentResponse, error)
}

type departmentService struct {
	store db.Querier
}

func NewDepartmentService(store db.Querier) DepartmentService {
	return &departmentService{store: store}
}

func (s *departmentService) ListDepartments(ctx context.Context) ([]DepartmentResponse, error) {
	rows, err := s.store.ListDepartments(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]DepartmentResponse, 0, len(rows))
	for _, row := range rows {
		res = append(res, DepartmentResponse{
			ID:          row.ID,
			Name:        row.Name,
			Description: row.Description,
		})
	}
	return res, nil
}

func (s *departmentService) GetDepartment(ctx context.Context, id string) (*DepartmentResponse, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, err
	}
	row, err := s.store.GetDepartment(ctx, uid)
	if err != nil {
		return nil, err
	}
	return &DepartmentResponse{
		ID:          row.ID,
		Name:        row.Name,
		Description: row.Description,
	}, nil
}
