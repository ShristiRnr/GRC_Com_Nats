package task

import (
	"context"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateTaskRequest struct {
	ProgramID         string `json:"program_id"`
	ControlID         string `json:"control_id"`
	AssetID           string `json:"asset_id"`
	OwnerID           string `json:"owner_id"`
	Title             string `json:"title"`
	Description       string `json:"description"`
	Status            string `json:"status"`
	OrgID             string `json:"org_id"`
	DueDate           string `json:"due_date"`
	VisibleToAssignee bool   `json:"visible_to_assignee"`
	TaskType          string `json:"task_type"`
	EvidenceRequired  any    `json:"evidence_required"`
}

type UpdateTaskStatusRequest struct {
	Status        string `json:"status"`
	Result        string `json:"result"`
	Notes         string `json:"notes"`
	ReviewerNotes string `json:"reviewer_notes"`
	AssessorNotes string `json:"assessor_notes"`
}

type CreateEvidenceRequest struct {
	TaskID     string `json:"task_id"`
	FilePath   string `json:"file_path"`
	FileName   string `json:"file_name"`
	Checksum   string `json:"checksum"`
	UploadedBy string `json:"uploaded_by"`
}

type AssignActorsRequest struct {
	OwnerID    string `json:"owner_id"`
	ReviewerID string `json:"reviewer_id"`
	AssessorID string `json:"assessor_id"`
}

type TaskService interface {
	CreateTask(ctx context.Context, req CreateTaskRequest) (*db.Task, error)
	ListTasks(ctx context.Context, orgID string) ([]db.Task, error)
	GetTask(ctx context.Context, id string) (*db.Task, error)
	UpdateTaskStatus(ctx context.Context, id string, req UpdateTaskStatusRequest) (*db.Task, error)
	AssignActors(ctx context.Context, id string, req AssignActorsRequest) (*db.Task, error)
	CreateEvidence(ctx context.Context, req CreateEvidenceRequest) (*db.Evidence, error)
	ListEvidence(ctx context.Context, taskID string) ([]db.Evidence, error)
}

type taskService struct {
	store db.Querier
}

func NewTaskService(store db.Querier) TaskService {
	return &taskService{store: store}
}

func (s *taskService) CreateTask(ctx context.Context, req CreateTaskRequest) (*db.Task, error) {
	var programID, controlID, assetID, ownerID, orgID pgtype.UUID
	programID.Scan(req.ProgramID)
	controlID.Scan(req.ControlID)
	assetID.Scan(req.AssetID)
	ownerID.Scan(req.OwnerID)
	orgID.Scan(req.OrgID)

	var dueDate pgtype.Date
	if req.DueDate != "" {
		dueDate.Scan(req.DueDate)
	}

	status := req.Status
	if status == "" {
		status = "todo"
	}

	task, err := s.store.CreateTask(ctx, db.CreateTaskParams{
		ProgramID:         programID,
		ControlID:         controlID,
		AssetID:           assetID,
		OwnerID:           ownerID,
		Title:             req.Title,
		Description:       pgtype.Text{String: req.Description, Valid: true},
		Status:            status,
		OrgID:             orgID,
		DueDate:           dueDate,
		VisibleToAssignee: pgtype.Bool{Bool: req.VisibleToAssignee, Valid: true},
		TaskType:          pgtype.Text{String: req.TaskType, Valid: true},
		// EvidenceRequired is handled as jsonb in DB
	})
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *taskService) ListTasks(ctx context.Context, orgID string) ([]db.Task, error) {
	var u pgtype.UUID
	u.Scan(orgID)
	tasks, err := s.store.ListTasksByOrg(ctx, u)
	if err != nil {
		return nil, err
	}
	if tasks == nil {
		return []db.Task{}, nil
	}
	return tasks, nil
}

func (s *taskService) GetTask(ctx context.Context, id string) (*db.Task, error) {
	var u pgtype.UUID
	u.Scan(id)
	task, err := s.store.GetTask(ctx, u)
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *taskService) UpdateTaskStatus(ctx context.Context, id string, req UpdateTaskStatusRequest) (*db.Task, error) {
	var u pgtype.UUID
	u.Scan(id)
	task, err := s.store.UpdateTaskStatus(ctx, db.UpdateTaskStatusParams{
		ID:            u,
		Status:        req.Status,
		Result:        pgtype.Text{String: req.Result, Valid: true},
		Notes:         pgtype.Text{String: req.Notes, Valid: true},
		ReviewerNotes: pgtype.Text{String: req.ReviewerNotes, Valid: true},
		AssessorNotes: pgtype.Text{String: req.AssessorNotes, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *taskService) AssignActors(ctx context.Context, id string, req AssignActorsRequest) (*db.Task, error) {
	var u, ownerID, reviewerID, assessorID pgtype.UUID
	u.Scan(id)
	ownerID.Scan(req.OwnerID)
	reviewerID.Scan(req.ReviewerID)
	assessorID.Scan(req.AssessorID)

	task, err := s.store.AssignTaskActors(ctx, db.AssignTaskActorsParams{
		ID:         u,
		OwnerID:    ownerID,
		ReviewerID: reviewerID,
		AssessorID: assessorID,
	})
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *taskService) CreateEvidence(ctx context.Context, req CreateEvidenceRequest) (*db.Evidence, error) {
	var taskID, uploadedBy pgtype.UUID
	taskID.Scan(req.TaskID)
	uploadedBy.Scan(req.UploadedBy)

	evidence, err := s.store.CreateEvidence(ctx, db.CreateEvidenceParams{
		TaskID:     taskID,
		FilePath:   req.FilePath,
		FileName:   req.FileName,
		Checksum:   req.Checksum,
		UploadedBy: uploadedBy,
	})
	if err != nil {
		return nil, err
	}
	return &evidence, nil
}

func (s *taskService) ListEvidence(ctx context.Context, taskID string) ([]db.Evidence, error) {
	var u pgtype.UUID
	u.Scan(taskID)
	return s.store.ListEvidenceByTask(ctx, u)
}
