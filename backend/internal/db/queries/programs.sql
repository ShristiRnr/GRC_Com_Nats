-- name: CreateProgram :one
INSERT INTO programs (
  name, description, type, status, start_date, end_date, progress, created_by
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: AddFrameworkToProgram :one
INSERT INTO program_frameworks (
  program_id, framework_id
) VALUES (
  $1, $2
)
RETURNING *;

-- name: AddScopeToProgram :one
INSERT INTO program_scope (
  program_id, resource_id, resource_type
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: ListPrograms :many
SELECT * FROM programs
ORDER BY start_date DESC;

-- name: GetProgram :one
SELECT * FROM programs
WHERE id = $1 LIMIT 1;
