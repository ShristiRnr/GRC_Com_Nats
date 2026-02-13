package control

import (
	"context"
	"fmt"
	"strings"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateControlRequest struct {
	Code        string      `json:"code"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Category    string      `json:"category"`
	OrgID       pgtype.UUID `json:"org_id"`
	FrameworkID string      `json:"framework_id"` // Optional
}

type UpdateControlRequest struct {
	Code        string `json:"code"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
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
	ID               pgtype.UUID        `json:"id"`
	Code             string             `json:"code"`
	Title            string             `json:"title"`
	Description      pgtype.Text        `json:"description"`
	Category         pgtype.Text        `json:"category"`
	Status           string             `json:"status"`
	FrameworkName    string             `json:"framework_name"`
	FrameworkNames   string             `json:"framework_names"`
	FrameworkCount   int64              `json:"framework_count"`
	Frameworks       []FrameworkShort   `json:"frameworks"`
	Evidence         []EvidenceResponse `json:"evidence"`
	Tasks            []TaskResponse     `json:"tasks"`
	Owner            *OwnerResponse     `json:"owner"`
	Domain           *DomainShort       `json:"domain"`
	ComplianceStatus *string            `json:"compliance_status"`
	AssetCount       int64              `json:"asset_count"`
	Assets           []AssetShort       `json:"assets"`
	RiskCount        int64              `json:"risk_count"`
	Risks            []RiskShort        `json:"risks"`
	MaxRiskScore     int32              `json:"max_risk_score"`
	CreatedAt        pgtype.Timestamptz `json:"created_at"`
	UpdatedAt        pgtype.Timestamptz `json:"updated_at"`
	OrgID            pgtype.UUID        `json:"org_id"`
}

type AssetShort struct {
	ID                  pgtype.UUID `json:"id"`
	Name                string      `json:"name"`
	Type                string      `json:"type"`
	Criticality         string      `json:"criticality"`
	Status              string      `json:"status"`
	ImplementationNotes pgtype.Text `json:"implementation_notes"`
	CoverageStatus      pgtype.Text `json:"coverage_status"`
}

type RiskShort struct {
	ID                 pgtype.UUID `json:"id"`
	Title              string      `json:"title"`
	Description        pgtype.Text `json:"description"`
	InherentImpact     int32       `json:"inherent_impact"`
	InherentLikelihood int32       `json:"inherent_likelihood"`
	Status             string      `json:"status"`
	Notes              pgtype.Text `json:"notes"`
	Effectiveness      pgtype.Text `json:"effectiveness"`
}

type FrameworkShort struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type EvidenceResponse struct {
	ID           pgtype.UUID        `json:"id"`
	Name         string             `json:"name"`
	Description  pgtype.Text        `json:"description"`
	EvidenceType string             `json:"evidence_type"`
	FileName     pgtype.Text        `json:"file_name"`
	FilePath     pgtype.Text        `json:"file_path"`
	ExternalUrl  pgtype.Text        `json:"external_url"`
	CollectedAt  pgtype.Timestamptz `json:"collected_at"`
	IsValid      bool               `json:"is_valid"`
	Checksum     pgtype.Text        `json:"checksum"`
	CreatedAt    pgtype.Timestamptz `json:"created_at"`
}

type TaskResponse struct {
	ID          pgtype.UUID        `json:"id"`
	Status      string             `json:"status"`
	Result      pgtype.Text        `json:"result"`
	DueDate     pgtype.Date        `json:"due_date"`
	ProgramName string             `json:"program_name"`
	CompletedAt pgtype.Timestamptz `json:"completed_at"`
}

type OwnerResponse struct {
	ID        pgtype.UUID `json:"id"`
	FullName  pgtype.Text `json:"full_name"`
	Email     string      `json:"email"`
	AvatarUrl pgtype.Text `json:"avatar_url"`
}

type DomainShort struct {
	ID   pgtype.UUID `json:"id"`
	Name string      `json:"name"`
}

type ControlService interface {
	CreateControl(ctx context.Context, req CreateControlRequest) (*db.Control, error)
	DeleteControl(ctx context.Context, controlID string) error
	UpdateControl(ctx context.Context, controlID string, req UpdateControlRequest) (*db.Control, error)
	ListControls(ctx context.Context, frameworkID *string) ([]db.Control, error)
	ListControlsAll(ctx context.Context, orgID string) ([]ControlResponse, error)
	GetControl(ctx context.Context, id string) (*ControlResponse, error)
	GetControlStats(ctx context.Context, orgID string) (*ControlStats, error)
	ImportControls(ctx context.Context, orgID string, controls []ImportControlDTO) (*ImportStats, error)

	LinkAsset(ctx context.Context, controlID string, assetID string, notes string) error
	UnlinkAsset(ctx context.Context, controlID string, assetID string) error
	LinkRisk(ctx context.Context, controlID string, riskID string, notes string) error
	UnlinkRisk(ctx context.Context, controlID string, riskID string) error

	// Control Mapping
	MapControl(ctx context.Context, frameworkID, controlID string) error
	UnmapControl(ctx context.Context, frameworkID, controlID string) error
	ListFrameworkControls(ctx context.Context, frameworkID string) ([]db.Control, error)
	ListAvailableControls(ctx context.Context, orgID, frameworkID string) ([]db.Control, error)
}

type controlService struct {
	store db.Querier
}

func NewControlService(store db.Querier) ControlService {
	return &controlService{
		store: store,
	}
}

func (s *controlService) CreateControl(ctx context.Context, req CreateControlRequest) (*db.Control, error) {
	ctrl, err := s.store.CreateControl(ctx, db.CreateControlParams{
		OrgID:       req.OrgID,
		Code:        req.Code,
		Title:       req.Title,
		Description: text(req.Description),
		Category:    text(req.Category),
	})
	if err != nil {
		return nil, err
	}

	if req.FrameworkID != "" {
		var fuid, cuid pgtype.UUID
		if err := fuid.Scan(req.FrameworkID); err == nil {
			if err := cuid.Scan(ctrl.ID); err == nil {
				_, _ = s.store.MapControl(ctx, db.MapControlParams{
					FrameworkID: fuid,
					ControlID:   cuid,
				})
			}
		}
	}

	return &ctrl, nil
}

func (s *controlService) UpdateControl(ctx context.Context, controlID string, req UpdateControlRequest) (*db.Control, error) {
	var uid pgtype.UUID
	if err := uid.Scan(controlID); err != nil {
		return nil, err
	}

	ctrl, err := s.store.UpdateControl(ctx, db.UpdateControlParams{
		ID:          uid,
		Title:       req.Title,
		Description: text(req.Description),
		Category:    text(req.Category),
		Code:        req.Code,
	})
	if err != nil {
		return nil, err
	}
	return &ctrl, nil
}

func (s *controlService) DeleteControl(ctx context.Context, controlID string) error {
	var uid pgtype.UUID
	if err := uid.Scan(controlID); err != nil {
		return err
	}
	return s.store.DeleteControl(ctx, uid)
}

func (s *controlService) ListControls(ctx context.Context, frameworkID *string) ([]db.Control, error) {
	if frameworkID != nil && *frameworkID != "" {
		var uid pgtype.UUID
		if err := uid.Scan(*frameworkID); err != nil {
			return nil, err
		}
		return s.store.ListControlsByFramework(ctx, uid)
	}
	return []db.Control{}, nil
}

func (s *controlService) ListControlsAll(ctx context.Context, orgID string) ([]ControlResponse, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}
	rows, err := s.store.ListAllControls(ctx, oid)
	if err != nil {
		return nil, err
	}
	res := make([]ControlResponse, 0, len(rows))
	for _, row := range rows {
		fwNamesStr, _ := row.FrameworkNames.(string)
		status := "draft"
		if row.Category.Valid && row.Category.String != "" {
			status = "active"
		}
		var frameworks []FrameworkShort
		if fwNamesStr != "" {
			names := strings.Split(fwNamesStr, ", ")
			for _, n := range names {
				frameworks = append(frameworks, FrameworkShort{Name: n})
			}
		}
		res = append(res, ControlResponse{
			ID:             row.ID,
			Code:           row.Code,
			Title:          row.Title,
			Description:    row.Description,
			Category:       row.Category,
			Status:         status,
			FrameworkNames: fwNamesStr,
			FrameworkCount: row.FrameworkCount,
			Frameworks:     frameworks,
			CreatedAt:      row.CreatedAt,
			UpdatedAt:      row.UpdatedAt,
			OrgID:          row.OrgID,
		})
	}
	return res, nil
}

func (s *controlService) GetControl(ctx context.Context, id string) (*ControlResponse, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, err
	}
	row, err := s.store.GetControl(ctx, uid)
	if err != nil {
		return nil, err
	}

	evidenceRows, _ := s.store.ListControlEvidence(ctx, uid)
	evidence := make([]EvidenceResponse, 0, len(evidenceRows))
	for _, e := range evidenceRows {
		evidence = append(evidence, EvidenceResponse{
			ID:           e.ID,
			Name:         e.Name,
			Description:  e.Description,
			EvidenceType: e.EvidenceType,
			FileName:     e.FileName,
			FilePath:     e.FilePath,
			ExternalUrl:  e.ExternalUrl,
			CollectedAt:  e.CollectedAt,
			IsValid:      e.IsValid.Bool,
			Checksum:     e.Checksum,
			CreatedAt:    e.CreatedAt,
		})
	}

	taskRows, _ := s.store.ListControlTasks(ctx, uid)
	tasks := make([]TaskResponse, 0, len(taskRows))
	var complianceStatus *string
	for _, t := range taskRows {
		tasks = append(tasks, TaskResponse{
			ID:          t.ID,
			Status:      t.Status,
			Result:      t.Result,
			DueDate:     t.DueDate,
			ProgramName: t.ProgramName.String,
			CompletedAt: t.UpdatedAt, // Assuming updated_at as completed_at for now
		})
		if complianceStatus == nil && t.Status == "completed" && t.Result.Valid {
			res := t.Result.String
			complianceStatus = &res
		}
	}

	assetRows, _ := s.store.ListControlAssets(ctx, uid)
	assets := make([]AssetShort, 0, len(assetRows))
	for _, a := range assetRows {
		assets = append(assets, AssetShort{
			ID:                  a.ID,
			Name:                a.Name,
			Type:                a.Type,
			Criticality:         a.Criticality,
			Status:              a.Status,
			ImplementationNotes: a.ImplementationNotes,
			CoverageStatus:      a.CoverageStatus,
		})
	}

	riskRows, _ := s.store.ListControlRisks(ctx, uid)
	risks := make([]RiskShort, 0, len(riskRows))
	for _, r := range riskRows {
		risks = append(risks, RiskShort{
			ID:                 r.ID,
			Title:              r.Title,
			Description:        r.Description,
			InherentImpact:     r.InherentImpact,
			InherentLikelihood: r.InherentLikelihood,
			Status:             r.Status,
			Notes:              r.Notes,
			Effectiveness:      r.Effectiveness,
		})
	}

	fwNamesStr, _ := row.FrameworkNames.(string)
	status := "draft"
	if row.Category.Valid && row.Category.String != "" {
		status = "active"
	}
	var frameworks []FrameworkShort
	if fwNamesStr != "" {
		names := strings.Split(fwNamesStr, ", ")
		for _, n := range names {
			frameworks = append(frameworks, FrameworkShort{Name: n})
		}
	}

	res := &ControlResponse{
		ID:               row.ID,
		Code:             row.Code,
		Title:            row.Title,
		Description:      row.Description,
		Category:         row.Category,
		Status:           status,
		FrameworkNames:   fwNamesStr,
		FrameworkCount:   row.FrameworkCount,
		Frameworks:       frameworks,
		Evidence:         evidence,
		Tasks:            tasks,
		Assets:           assets,
		AssetCount:       row.AssetCount,
		Risks:            risks,
		RiskCount:        row.RiskCount,
		MaxRiskScore:     row.MaxRiskScore,
		ComplianceStatus: complianceStatus,
		CreatedAt:        row.CreatedAt,
		UpdatedAt:        row.UpdatedAt,
		OrgID:            row.OrgID,
	}

	if row.DomainID.Valid {
		res.Domain = &DomainShort{
			ID:   row.DomainID,
			Name: row.DomainName.String,
		}
	}

	if row.OwnerID.Valid {
		res.Owner = &OwnerResponse{
			ID:        row.OwnerID,
			FullName:  row.OwnerName,
			Email:     row.OwnerEmail.String,
			AvatarUrl: row.OwnerAvatarUrl,
		}
	}

	return res, nil
}

func (s *controlService) GetControlStats(ctx context.Context, orgID string) (*ControlStats, error) {
	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}

	stats, err := s.store.GetControlStats(ctx, oid)
	if err != nil {
		return nil, err
	}

	return &ControlStats{
		TotalControls:    stats.TotalControls,
		ActiveControls:   stats.ActiveControls,
		DraftControls:    stats.DraftControls,
		MappedControls:   stats.MappedControls,
		UniqueCategories: stats.UniqueCategories,
	}, nil
}

func (s *controlService) ImportControls(ctx context.Context, orgID string, controls []ImportControlDTO) (*ImportStats, error) {
	stats := &ImportStats{
		Warnings: []string{},
		Errors:   []string{},
	}

	var oid pgtype.UUID
	if err := oid.Scan(orgID); err != nil {
		return nil, err
	}

	fws, err := s.store.ListFrameworks(ctx, oid)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch frameworks: %w", err)
	}
	fwMap := make(map[string]pgtype.UUID)
	for _, f := range fws {
		fwMap[f.Name] = f.ID
	}

	for i, c := range controls {
		rowNum := i + 1
		ctrl, err := s.store.UpsertControl(ctx, db.UpsertControlParams{
			OrgID:       oid,
			Code:        c.Code,
			Title:       c.Title,
			Description: text(c.Description),
			Category:    text(c.Category),
		})
		if err != nil {
			stats.Failed++
			stats.Errors = append(stats.Errors, fmt.Sprintf("Row %d (%s): %v", rowNum, c.Code, err))
			continue
		}
		stats.Processed++

		for _, fwName := range c.Frameworks {
			if fwID, ok := fwMap[fwName]; ok {
				_, _ = s.store.MapControl(ctx, db.MapControlParams{
					FrameworkID: fwID,
					ControlID:   ctrl.ID,
				})
			} else {
				stats.Warnings = append(stats.Warnings, fmt.Sprintf("Row %d: Framework '%s' not found", rowNum, fwName))
			}
		}
	}

	return stats, nil
}

func (s *controlService) MapControl(ctx context.Context, frameworkID, controlID string) error {
	var fuid, cuid pgtype.UUID
	if err := fuid.Scan(frameworkID); err != nil {
		return err
	}
	if err := cuid.Scan(controlID); err != nil {
		return err
	}

	_, err := s.store.MapControl(ctx, db.MapControlParams{
		FrameworkID: fuid,
		ControlID:   cuid,
	})
	return err
}

func (s *controlService) UnmapControl(ctx context.Context, frameworkID, controlID string) error {
	var fuid, cuid pgtype.UUID
	if err := fuid.Scan(frameworkID); err != nil {
		return err
	}
	if err := cuid.Scan(controlID); err != nil {
		return err
	}

	return s.store.UnmapControl(ctx, db.UnmapControlParams{
		FrameworkID: fuid,
		ControlID:   cuid,
	})
}

func (s *controlService) LinkAsset(ctx context.Context, controlID string, assetID string, notes string) error {
	var cID, aID pgtype.UUID
	if err := cID.Scan(controlID); err != nil {
		return err
	}
	if err := aID.Scan(assetID); err != nil {
		return err
	}
	_, err := s.store.CreateAssetControl(ctx, db.CreateAssetControlParams{
		ControlID:           cID,
		AssetID:             aID,
		ImplementationNotes: pgtype.Text{String: notes, Valid: notes != ""},
		CoverageStatus:      pgtype.Text{String: "planned", Valid: true},
	})
	return err
}

func (s *controlService) UnlinkAsset(ctx context.Context, controlID string, assetID string) error {
	var cID, aID pgtype.UUID
	if err := cID.Scan(controlID); err != nil {
		return err
	}
	if err := aID.Scan(assetID); err != nil {
		return err
	}
	return s.store.DeleteAssetControl(ctx, db.DeleteAssetControlParams{
		ControlID: cID,
		AssetID:   aID,
	})
}

func (s *controlService) LinkRisk(ctx context.Context, controlID string, riskID string, notes string) error {
	var cID, rID pgtype.UUID
	if err := cID.Scan(controlID); err != nil {
		return err
	}
	if err := rID.Scan(riskID); err != nil {
		return err
	}
	_, err := s.store.CreateRiskControl(ctx, db.CreateRiskControlParams{
		ControlID:     cID,
		RiskID:        rID,
		Notes:         pgtype.Text{String: notes, Valid: notes != ""},
		Effectiveness: pgtype.Text{String: "untested", Valid: true},
	})
	return err
}

func (s *controlService) UnlinkRisk(ctx context.Context, controlID string, riskID string) error {
	var cID, rID pgtype.UUID
	if err := cID.Scan(controlID); err != nil {
		return err
	}
	if err := rID.Scan(riskID); err != nil {
		return err
	}
	return s.store.DeleteRiskControl(ctx, db.DeleteRiskControlParams{
		ControlID: cID,
		RiskID:    rID,
	})
}

func (s *controlService) ListFrameworkControls(ctx context.Context, frameworkID string) ([]db.Control, error) {
	var uid pgtype.UUID
	if err := uid.Scan(frameworkID); err != nil {
		return nil, err
	}
	return s.store.ListControlsByFramework(ctx, uid)
}

func (s *controlService) ListAvailableControls(ctx context.Context, orgID, frameworkID string) ([]db.Control, error) {
	var ouid, fuid pgtype.UUID
	if err := ouid.Scan(orgID); err != nil {
		return nil, err
	}
	if err := fuid.Scan(frameworkID); err != nil {
		return nil, err
	}

	return s.store.ListAvailableControls(ctx, db.ListAvailableControlsParams{
		OrgID:       ouid,
		FrameworkID: fuid,
	})
}

func text(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}
