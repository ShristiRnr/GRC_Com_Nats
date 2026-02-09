-- name: CreateUser :one
INSERT INTO users (username, email)
VALUES ($1, $2)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY id;

-- name: CreateTask :one
INSERT INTO tasks (title, payload)
VALUES ($1, $2)
RETURNING *;

-- name: UpdateTaskStatus :one
UPDATE tasks
SET status = $2, result = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
