-- name: CreateFramework :one
INSERT INTO frameworks (
  name, description, version, status, org_id
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: ListFrameworks :many
SELECT 
    f.*,
    (SELECT COUNT(*) FROM framework_controls fc WHERE fc.framework_id = f.id) as control_count,
    (
        SELECT COALESCE(ROUND(COUNT(DISTINCT tc.control_id)::FLOAT / NULLIF(COUNT(DISTINCT fc.control_id), 0) * 100), 0)
        FROM framework_controls fc
        LEFT JOIN (
            SELECT DISTINCT control_id 
            FROM tasks 
            WHERE status = 'completed' AND result = 'compliant'
        ) tc ON fc.control_id = tc.control_id
        WHERE fc.framework_id = f.id
    ) as progress
FROM frameworks f
WHERE f.org_id = $1
ORDER BY f.name;

-- name: GetFramework :one
SELECT 
    f.*,
    (SELECT COUNT(*) FROM framework_controls fc WHERE fc.framework_id = f.id) as control_count,
    (
        SELECT COALESCE(ROUND(COUNT(DISTINCT tc.control_id)::FLOAT / NULLIF(COUNT(DISTINCT fc.control_id), 0) * 100), 0)
        FROM framework_controls fc
        LEFT JOIN (
            SELECT DISTINCT control_id 
            FROM tasks 
            WHERE status = 'completed' AND result = 'compliant'
        ) tc ON fc.control_id = tc.control_id
        WHERE fc.framework_id = f.id
    ) as progress
FROM frameworks f
WHERE f.id = $1 AND f.org_id = $2 LIMIT 1;

-- name: UpdateFramework :one
UPDATE frameworks
SET name = $2, description = $3, version = $4, updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND org_id = $5
RETURNING *;

-- name: UpdateFrameworkStatus :one
UPDATE frameworks
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND org_id = $3
RETURNING *;

-- name: DeleteFramework :exec
DELETE FROM frameworks
WHERE id = $1 AND org_id = $2;

-- name: CreateControl :one
INSERT INTO controls (
  org_id, code, title, description, category
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: ListControlsByFramework :many
SELECT c.* FROM controls c
JOIN framework_controls fc ON c.id = fc.control_id
WHERE fc.framework_id = $1
ORDER BY c.code;

-- name: ListAvailableControls :many
-- Controls not yet mapped to this specific framework
SELECT c.* FROM controls c
WHERE c.org_id = $1 AND c.id NOT IN (
    SELECT control_id FROM framework_controls WHERE framework_id = $2
)
ORDER BY c.code;

-- name: MapControl :one
INSERT INTO framework_controls (
  framework_id, control_id
) VALUES (
  $1, $2
)
RETURNING *;

-- name: UnmapControl :exec
DELETE FROM framework_controls
WHERE framework_id = $1 AND control_id = $2;

-- name: ListControlsByAsset :many
SELECT c.*, ac.coverage_status 
FROM controls c
JOIN asset_controls ac ON c.id = ac.control_id
WHERE ac.asset_id = $1;

-- name: ListAllControls :many
SELECT c.*,
       COALESCE(
         (SELECT STRING_AGG(f.name, ', ') FROM framework_controls fc
          JOIN frameworks f ON f.id = fc.framework_id
          WHERE fc.control_id = c.id),
         ''
       ) as framework_names,
       (SELECT COUNT(*) FROM framework_controls fc WHERE fc.control_id = c.id) as framework_count
FROM controls c
WHERE c.org_id = $1
ORDER BY c.code;

-- name: GetControl :one
SELECT 
    c.*,
    cd.name as domain_name,
    p.full_name as owner_name,
    p.email as owner_email,
    p.avatar_url as owner_avatar_url,
    COALESCE(
        (SELECT STRING_AGG(f.name, ', ') FROM framework_controls fc
         JOIN frameworks f ON f.id = fc.framework_id
         WHERE fc.control_id = c.id),
        ''
    ) as framework_names,
    (SELECT COUNT(*) FROM framework_controls fc WHERE fc.control_id = c.id) as framework_count,
    (SELECT COUNT(*) FROM asset_controls ac WHERE ac.control_id = c.id) as asset_count,
    (SELECT COUNT(*) FROM risk_controls rc WHERE rc.control_id = c.id) as risk_count,
    COALESCE(
        (SELECT MAX(r.inherent_impact * r.inherent_likelihood) 
         FROM risk_controls rc 
         JOIN risks r ON r.id = rc.risk_id 
         WHERE rc.control_id = c.id), 
        0
    )::int as max_risk_score
FROM controls c
LEFT JOIN control_domains cd ON c.domain_id = cd.id
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE c.id = $1;

-- name: DeleteControl :exec
DELETE FROM controls WHERE id = $1;

-- name: GetControlStats :one
SELECT
  COUNT(*)::bigint as total_controls,
  COUNT(*) FILTER (WHERE c.category IS NOT NULL AND c.category != '')::bigint as active_controls,
  COUNT(*) FILTER (WHERE c.category IS NULL OR c.category = '')::bigint as draft_controls,
  (SELECT COUNT(DISTINCT fc.control_id)::bigint FROM framework_controls fc JOIN controls c2 ON c2.id = fc.control_id WHERE c2.org_id = $1) as mapped_controls,
  COUNT(DISTINCT c.category) FILTER (WHERE c.category IS NOT NULL AND c.category != '')::bigint as unique_categories
FROM controls c
WHERE c.org_id = $1;

-- name: UpdateControl :one
UPDATE controls
SET title = $2, description = $3, category = $4, code = $5, updated_at = CURRENT_TIMESTAMP, 
    owner_id = $6, department_id = $7, domain_id = $8
WHERE id = $1
RETURNING *;

-- name: ListControlEvidence :many
SELECT * FROM control_evidence
WHERE control_id = $1
ORDER BY created_at DESC;

-- name: CreateControlEvidence :one
INSERT INTO control_evidence (
    control_id, name, description, evidence_type, file_name, file_path, external_url, checksum
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: ListControlTasks :many
SELECT t.*, p.name as program_name
FROM tasks t
LEFT JOIN programs p ON t.program_id = p.id
WHERE t.control_id = $1
ORDER BY t.created_at DESC
LIMIT 10;

-- name: MapAssetControl :one
INSERT INTO asset_controls (
  asset_id, control_id, coverage_status, implementation_notes
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: UpsertControl :one
INSERT INTO controls (
  org_id, code, title, description, category
) VALUES (
  $1, $2, $3, $4, $5
)
ON CONFLICT (org_id, code) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;
