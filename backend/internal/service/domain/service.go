package domain

import (
	"context"
	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type DomainResponse struct {
	ID          pgtype.UUID `json:"id"`
	Name        string      `json:"name"`
	Description pgtype.Text `json:"description"`
}

type DomainService interface {
	ListDomains(ctx context.Context, orgID string) ([]DomainResponse, error)
	CreateDomain(ctx context.Context, orgID string, name string) (*DomainResponse, error)
}

type domainService struct {
	store db.Querier
}

func NewDomainService(store db.Querier) DomainService {
	return &domainService{store: store}
}

func (s *domainService) ListDomains(ctx context.Context, orgID string) ([]DomainResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}
	rows, err := s.store.ListDomains(ctx, oid)
	if err != nil {
		return nil, err
	}
	res := make([]DomainResponse, 0, len(rows))
	for _, row := range rows {
		res = append(res, DomainResponse{
			ID:          row.ID,
			Name:        row.Name,
			Description: row.Description,
		})
	}
	return res, nil
}

func (s *domainService) CreateDomain(ctx context.Context, orgID string, name string) (*DomainResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}
	row, err := s.store.CreateDomain(ctx, db.CreateDomainParams{
		OrgID: oid,
		Name:  name,
	})
	if err != nil {
		return nil, err
	}
	return &DomainResponse{
		ID:          row.ID,
		Name:        row.Name,
		Description: row.Description,
	}, nil
}
