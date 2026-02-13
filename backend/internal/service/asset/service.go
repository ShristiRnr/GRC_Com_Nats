package asset

import (
	"context"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateAssetRequest struct {
	OrgID           string `json:"org_id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	Type            string `json:"type"`
	CategoryID      string `json:"category_id"`
	TypeID          string `json:"type_id"`
	DepartmentID    string `json:"department_id"`
	OwnerID         string `json:"owner_id"`
	Criticality     string `json:"criticality"`
	Confidentiality int32  `json:"confidentiality"`
	Integrity       int32  `json:"integrity"`
	Availability    int32  `json:"availability"`
	Status          string `json:"status"`
}

type UpdateAssetRequest struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	Type            string `json:"type"`
	CategoryID      string `json:"category_id"`
	TypeID          string `json:"type_id"`
	DepartmentID    string `json:"department_id"`
	OwnerID         string `json:"owner_id"`
	Criticality     string `json:"criticality"`
	Confidentiality int32  `json:"confidentiality"`
	Integrity       int32  `json:"integrity"`
	Availability    int32  `json:"availability"`
	Status          string `json:"status"`
}

type AssetService interface {
	CreateAsset(ctx context.Context, req CreateAssetRequest) (*db.Asset, error)
	ListAssets(ctx context.Context) ([]db.Asset, error)
	GetAsset(ctx context.Context, id string) (*db.Asset, error)
	UpdateAsset(ctx context.Context, id string, req UpdateAssetRequest) (*db.Asset, error)
	DeleteAsset(ctx context.Context, id string) error
	ListCategories(ctx context.Context) ([]db.AssetCategory, error)
	ListTypes(ctx context.Context) ([]db.AssetType, error)
}

type assetService struct {
	store db.Querier
}

func NewAssetService(store db.Querier) AssetService {
	return &assetService{store: store}
}

func (s *assetService) CreateAsset(ctx context.Context, req CreateAssetRequest) (*db.Asset, error) {
	var orgID, catID, typID, deptID, ownerID pgtype.UUID
	orgID.Scan(req.OrgID)
	catID.Scan(req.CategoryID)
	typID.Scan(req.TypeID)
	deptID.Scan(req.DepartmentID)
	ownerID.Scan(req.OwnerID)

	status := req.Status
	if status == "" {
		status = "active"
	}

	asset, err := s.store.CreateAsset(ctx, db.CreateAssetParams{
		OrgID:        orgID,
		Name:         req.Name,
		Description:  pgtype.Text{String: req.Description, Valid: true},
		Type:         req.Type,
		CategoryID:   catID,
		TypeID:       typID,
		DepartmentID: deptID,
		OwnerID:      ownerID,
		Criticality:  req.Criticality,
		Status:       status,
	})
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (s *assetService) ListAssets(ctx context.Context) ([]db.Asset, error) {
	return s.store.ListAssets(ctx)
}

func (s *assetService) GetAsset(ctx context.Context, id string) (*db.Asset, error) {
	var u pgtype.UUID
	u.Scan(id)
	asset, err := s.store.GetAsset(ctx, u)
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (s *assetService) UpdateAsset(ctx context.Context, id string, req UpdateAssetRequest) (*db.Asset, error) {
	var u, catID, typID, deptID, ownerID pgtype.UUID
	u.Scan(id)
	catID.Scan(req.CategoryID)
	typID.Scan(req.TypeID)
	deptID.Scan(req.DepartmentID)
	ownerID.Scan(req.OwnerID)

	asset, err := s.store.UpdateAsset(ctx, db.UpdateAssetParams{
		ID:           u,
		Name:         req.Name,
		Description:  pgtype.Text{String: req.Description, Valid: true},
		Type:         req.Type,
		CategoryID:   catID,
		TypeID:       typID,
		DepartmentID: deptID,
		OwnerID:      ownerID,
		Criticality:  req.Criticality,
		Status:       req.Status,
	})
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (s *assetService) DeleteAsset(ctx context.Context, id string) error {
	var u pgtype.UUID
	u.Scan(id)
	return s.store.DeleteAsset(ctx, u)
}

func (s *assetService) ListCategories(ctx context.Context) ([]db.AssetCategory, error) {
	return s.store.ListAssetCategories(ctx)
}

func (s *assetService) ListTypes(ctx context.Context) ([]db.AssetType, error) {
	return s.store.ListAssetTypes(ctx)
}
