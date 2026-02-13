-- name: CreateAsset :one
INSERT INTO assets (
    org_id, name, description, type, category_id, type_id, department_id, owner_id, criticality, status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: ListAssets :many
SELECT * FROM assets
ORDER BY name ASC;

-- name: GetAsset :one
SELECT * FROM assets
WHERE id = $1 LIMIT 1;

-- name: UpdateAsset :one
UPDATE assets
SET 
    name = $2,
    description = $3,
    type = $4,
    category_id = $5,
    type_id = $6,
    department_id = $7,
    owner_id = $8,
    criticality = $9,
    status = $10,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteAsset :exec
DELETE FROM assets
WHERE id = $1;

-- name: ListAssetCategories :many
SELECT * FROM asset_categories ORDER BY name;

-- name: ListAssetTypes :many
SELECT * FROM asset_types ORDER BY name;

-- name: CreateAssetControl :one
INSERT INTO asset_controls (
    asset_id, control_id, implementation_notes, coverage_status
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: DeleteAssetControl :exec
DELETE FROM asset_controls
WHERE asset_id = $1 AND control_id = $2;

-- name: ListControlAssets :many
SELECT a.*, ac.implementation_notes, ac.coverage_status, ac.created_at as mapping_created_at
FROM assets a
JOIN asset_controls ac ON a.id = ac.asset_id
WHERE ac.control_id = $1;
