-- name: CreateTask :one
INSERT INTO tasks (
    program_id, control_id, asset_id, owner_id, title, description, status, org_id, due_date, visible_to_assignee, task_type, evidence_required
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
) RETURNING *;

-- name: ListTasksByOrg :many
SELECT * FROM tasks
WHERE org_id = $1
ORDER BY due_date ASC, created_at DESC;

-- name: GetTask :one
SELECT * FROM tasks
WHERE id = $1 LIMIT 1;

-- name: UpdateTaskStatus :one
UPDATE tasks
SET 
    status = $2, 
    result = $3, 
    notes = $4,
    reviewer_notes = $5,
    assessor_notes = $6,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: AssignTaskActors :one
UPDATE tasks
SET 
    owner_id = $2,
    reviewer_id = $3,
    assessor_id = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: CreateEvidence :one
INSERT INTO evidence (
    task_id, file_path, file_name, checksum, uploaded_by
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListEvidenceByTask :many
SELECT * FROM evidence
WHERE task_id = $1;
