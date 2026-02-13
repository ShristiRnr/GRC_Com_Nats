-- name: CreateDepartment :one
INSERT INTO departments (
  name, description, head_user_id, org_id
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: ListDepartments :many
SELECT * FROM departments
ORDER BY name;

-- name: GetDepartment :one
SELECT * FROM departments
WHERE id = $1 LIMIT 1;
