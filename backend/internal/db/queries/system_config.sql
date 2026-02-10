-- name: GetSystemConfig :one
SELECT * FROM system_config WHERE key = $1 LIMIT 1;

-- name: SetSystemConfig :one
INSERT INTO system_config (key, value)
VALUES ($1, $2)
ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
RETURNING *;
