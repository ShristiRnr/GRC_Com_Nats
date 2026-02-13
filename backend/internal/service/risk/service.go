package risk

import (
	"context"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateRiskRequest struct {
	OrgID              string `json:"org_id"`
	Title              string `json:"title"`
	Description        string `json:"description"`
	InherentImpact     int32  `json:"inherent_impact"`
	InherentLikelihood int32  `json:"inherent_likelihood"`
	Status             string `json:"status"`
	OwnerID            string `json:"owner_id"`
	Category           string `json:"category"`
	ResponseStrategy   string `json:"response_strategy"`
	MitigationPlan     string `json:"mitigation_plan"`
	ReviewDate         string `json:"review_date"`
	SourceTaskID       string `json:"source_task_id"`
}

type UpdateRiskRequest struct {
	Title              string `json:"title"`
	Description        string `json:"description"`
	InherentImpact     int32  `json:"inherent_impact"`
	InherentLikelihood int32  `json:"inherent_likelihood"`
	ResidualImpact     int32  `json:"residual_impact"`
	ResidualLikelihood int32  `json:"residual_likelihood"`
	Status             string `json:"status"`
	TreatmentPlan      string `json:"treatment_plan"`
	OwnerID            string `json:"owner_id"`
	Category           string `json:"category"`
	ResponseStrategy   string `json:"response_strategy"`
	MitigationPlan     string `json:"mitigation_plan"`
	ReviewDate         string `json:"review_date"`
}

type LinkControlRequest struct {
	RiskID        string `json:"risk_id"`
	ControlID     string `json:"control_id"`
	Effectiveness string `json:"effectiveness"`
	Notes         string `json:"notes"`
}

type RiskService interface {
	CreateRisk(ctx context.Context, req CreateRiskRequest) (*db.Risk, error)
	ListRisks(ctx context.Context, orgID string) ([]db.Risk, error)
	GetRisk(ctx context.Context, id string) (*db.Risk, error)
	UpdateRisk(ctx context.Context, id string, req UpdateRiskRequest) (*db.Risk, error)
	DeleteRisk(ctx context.Context, id string) error
	LinkControl(ctx context.Context, req LinkControlRequest) error
	ListRiskControls(ctx context.Context, riskID string) ([]db.RiskControl, error)
}

type riskService struct {
	store db.Querier
}

func NewRiskService(store db.Querier) RiskService {
	return &riskService{store: store}
}

func (s *riskService) CreateRisk(ctx context.Context, req CreateRiskRequest) (*db.Risk, error) {
	var orgID, ownerID, sourceTaskID pgtype.UUID
	orgID.Scan(req.OrgID)
	if req.OwnerID != "" {
		ownerID.Scan(req.OwnerID)
	}
	if req.SourceTaskID != "" {
		sourceTaskID.Scan(req.SourceTaskID)
	}

	var reviewDate pgtype.Date
	if req.ReviewDate != "" {
		reviewDate.Scan(req.ReviewDate)
	}

	status := req.Status
	if status == "" {
		status = "identified"
	}

	risk, err := s.store.CreateRisk(ctx, db.CreateRiskParams{
		OrgID:              orgID,
		Title:              req.Title,
		Description:        pgtype.Text{String: req.Description, Valid: true},
		InherentImpact:     req.InherentImpact,
		InherentLikelihood: req.InherentLikelihood,
		Status:             status,
		OwnerID:            ownerID,
		Category:           pgtype.Text{String: req.Category, Valid: true},
		ResponseStrategy:   pgtype.Text{String: req.ResponseStrategy, Valid: true},
		MitigationPlan:     pgtype.Text{String: req.MitigationPlan, Valid: true},
		ReviewDate:         reviewDate,
		SourceTaskID:       sourceTaskID,
	})
	if err != nil {
		return nil, err
	}
	return &risk, nil
}

func (s *riskService) ListRisks(ctx context.Context, orgID string) ([]db.Risk, error) {
	var u pgtype.UUID
	u.Scan(orgID)
	return s.store.ListRisksByOrg(ctx, u)
}

func (s *riskService) GetRisk(ctx context.Context, id string) (*db.Risk, error) {
	var u pgtype.UUID
	u.Scan(id)
	risk, err := s.store.GetRisk(ctx, u)
	if err != nil {
		return nil, err
	}
	return &risk, nil
}

func (s *riskService) UpdateRisk(ctx context.Context, id string, req UpdateRiskRequest) (*db.Risk, error) {
	var u, ownerID pgtype.UUID
	u.Scan(id)
	if req.OwnerID != "" {
		ownerID.Scan(req.OwnerID)
	}

	var reviewDate pgtype.Date
	if req.ReviewDate != "" {
		reviewDate.Scan(req.ReviewDate)
	}

	risk, err := s.store.UpdateRisk(ctx, db.UpdateRiskParams{
		ID:                 u,
		Title:              req.Title,
		Description:        pgtype.Text{String: req.Description, Valid: true},
		InherentImpact:     req.InherentImpact,
		InherentLikelihood: req.InherentLikelihood,
		ResidualImpact:     pgtype.Int4{Int32: req.ResidualImpact, Valid: true},
		ResidualLikelihood: pgtype.Int4{Int32: req.ResidualLikelihood, Valid: true},
		Status:             req.Status,
		TreatmentPlan:      pgtype.Text{String: req.TreatmentPlan, Valid: true},
		OwnerID:            ownerID,
		Category:           pgtype.Text{String: req.Category, Valid: true},
		ResponseStrategy:   pgtype.Text{String: req.ResponseStrategy, Valid: true},
		MitigationPlan:     pgtype.Text{String: req.MitigationPlan, Valid: true},
		ReviewDate:         reviewDate,
	})
	if err != nil {
		return nil, err
	}
	return &risk, nil
}

func (s *riskService) DeleteRisk(ctx context.Context, id string) error {
	var u pgtype.UUID
	u.Scan(id)
	return s.store.DeleteRisk(ctx, u)
}

func (s *riskService) LinkControl(ctx context.Context, req LinkControlRequest) error {
	var riskID, controlID pgtype.UUID
	riskID.Scan(req.RiskID)
	controlID.Scan(req.ControlID)

	return s.store.LinkRiskToControl(ctx, db.LinkRiskToControlParams{
		RiskID:        riskID,
		ControlID:     controlID,
		Effectiveness: pgtype.Text{String: req.Effectiveness, Valid: true},
		Notes:         pgtype.Text{String: req.Notes, Valid: true},
	})
}

func (s *riskService) ListRiskControls(ctx context.Context, riskID string) ([]db.RiskControl, error) {
	var u pgtype.UUID
	u.Scan(riskID)
	return s.store.ListRiskControls(ctx, u)
}
