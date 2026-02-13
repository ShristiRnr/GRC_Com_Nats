-- name: ListCategories :many
SELECT * FROM control_categories
WHERE org_id = $1 OR org_id IS NULL
ORDER BY name;

-- name: CreateCategory :one
INSERT INTO control_categories (
    org_id, name, description
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: ListDomains :many
SELECT * FROM control_domains
WHERE org_id = $1 OR org_id IS NULL
ORDER BY name;

-- name: CreateDomain :one
INSERT INTO control_domains (
    org_id, name, description
) VALUES (
    $1, $2, $3
)
RETURNING *;
