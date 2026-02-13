-- name: CreateRisk :one
INSERT INTO risks (
    org_id, title, description, inherent_impact, inherent_likelihood, status, owner_id, 
    category, response_strategy, mitigation_plan, review_date, source_task_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
) RETURNING *;

-- name: ListRisksByOrg :many
SELECT * FROM risks
WHERE org_id = $1
ORDER BY inherent_impact * inherent_likelihood DESC, created_at DESC;

-- name: GetRisk :one
SELECT * FROM risks
WHERE id = $1 LIMIT 1;

-- name: UpdateRisk :one
UPDATE risks
SET 
    title = $2,
    description = $3,
    inherent_impact = $4,
    inherent_likelihood = $5,
    residual_impact = $6,
    residual_likelihood = $7,
    status = $8,
    treatment_plan = $9,
    owner_id = $10,
    category = $11,
    response_strategy = $12,
    mitigation_plan = $13,
    review_date = $14,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteRisk :exec
DELETE FROM risks
WHERE id = $1;

-- name: LinkRiskToControl :exec
INSERT INTO risk_controls (risk_id, control_id, effectiveness, notes)
VALUES ($1, $2, $3, $4)
ON CONFLICT (risk_id, control_id) DO UPDATE SET
    effectiveness = EXCLUDED.effectiveness,
    notes = EXCLUDED.notes;

-- name: ListControlRisks :many
SELECT r.*, rc.notes, rc.effectiveness, rc.mapped_at as mapping_created_at
FROM risks r
JOIN risk_controls rc ON r.id = rc.risk_id
WHERE rc.control_id = $1;

-- name: CreateRiskControl :one
INSERT INTO risk_controls (
    risk_id, control_id, notes, effectiveness
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: DeleteRiskControl :exec
DELETE FROM risk_controls
WHERE risk_id = $1 AND control_id = $2;

-- name: ListRiskControls :many
SELECT * FROM risk_controls WHERE risk_id = $1;
