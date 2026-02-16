-- name: CreateRole :one
INSERT INTO roles (name, description)
VALUES ($1, $2)
RETURNING *;

-- name: GetRole :one
SELECT * FROM roles
WHERE id = $1 LIMIT 1;

-- name: GetRoleByName :one
SELECT * FROM roles
WHERE name = $1 LIMIT 1;

-- name: ListRoles :many
SELECT * FROM roles
ORDER BY name;

-- name: CreatePermission :one
INSERT INTO permissions (code, description)
VALUES ($1, $2)
RETURNING *;

-- name: GetPermission :one
SELECT * FROM permissions
WHERE id = $1 LIMIT 1;

-- name: GetPermissionByCode :one
SELECT * FROM permissions
WHERE code = $1 LIMIT 1;

-- name: ListPermissions :many
SELECT * FROM permissions
ORDER BY code;

-- name: AddPermissionToRole :exec
INSERT INTO role_permissions (role_id, permission_id)
VALUES ($1, $2);

-- name: RemovePermissionFromRole :exec
DELETE FROM role_permissions
WHERE role_id = $1 AND permission_id = $2;

-- name: GetRolePermissions :many
SELECT p.* FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = $1;

-- name: GetUserPermissions :many
-- This assumes users table has a role column that matches a role name or we link them
-- For now, let's assume we lookup by role name since users table has a role string
SELECT p.code FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = $1;
