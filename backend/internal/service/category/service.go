package category

import (
	"context"
	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CategoryResponse struct {
	ID          pgtype.UUID `json:"id"`
	Name        string      `json:"name"`
	Description pgtype.Text `json:"description"`
}

type CategoryService interface {
	ListCategories(ctx context.Context, orgID string) ([]CategoryResponse, error)
	CreateCategory(ctx context.Context, orgID string, name string) (*CategoryResponse, error)
}

type categoryService struct {
	store db.Querier
}

func NewCategoryService(store db.Querier) CategoryService {
	return &categoryService{store: store}
}

func (s *categoryService) ListCategories(ctx context.Context, orgID string) ([]CategoryResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}
	rows, err := s.store.ListCategories(ctx, oid)
	if err != nil {
		return nil, err
	}
	res := make([]CategoryResponse, 0, len(rows))
	for _, row := range rows {
		res = append(res, CategoryResponse{
			ID:          row.ID,
			Name:        row.Name,
			Description: row.Description,
		})
	}
	return res, nil
}

func (s *categoryService) CreateCategory(ctx context.Context, orgID string, name string) (*CategoryResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}
	row, err := s.store.CreateCategory(ctx, db.CreateCategoryParams{
		OrgID: oid,
		Name:  name,
	})
	if err != nil {
		return nil, err
	}
	return &CategoryResponse{
		ID:          row.ID,
		Name:        row.Name,
		Description: row.Description,
	}, nil
}
