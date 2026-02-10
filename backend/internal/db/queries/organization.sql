-- name: CreateOrganization :one
INSERT INTO organizations (name)
VALUES ($1)
RETURNING *;

-- name: ListOrganizations :many
SELECT * FROM organizations
ORDER BY created_at DESC;

-- name: GetOrganization :one
SELECT * FROM organizations
WHERE id = $1 LIMIT 1;
