-- name: CreateSession :one
INSERT INTO sessions (
    user_id,
    refresh_token,
    user_agent,
    client_ip,
    is_blocked,
    expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: GetSession :one
SELECT * FROM sessions
WHERE id = $1 LIMIT 1;

-- name: UpdateSessionBlock :one
UPDATE sessions
SET is_blocked = $2
WHERE id = $1
RETURNING *;

-- name: UpdateSessionRefreshToken :one
UPDATE sessions
SET refresh_token = $2
WHERE id = $1
RETURNING *;

-- name: DeleteSession :exec
DELETE FROM sessions
WHERE id = $1;

-- name: GetSessionForUpdate :one
SELECT * FROM sessions
WHERE id = $1 LIMIT 1
FOR UPDATE;

-- name: ListSessionsForUpdate :many
SELECT * FROM sessions
WHERE user_id = $1 AND is_blocked = false
ORDER BY created_at ASC
FOR UPDATE;

-- name: DeleteOldestSession :exec
DELETE FROM sessions
WHERE id = (
    SELECT s.id FROM sessions s
    WHERE s.user_id = $1
    ORDER BY s.created_at ASC
    LIMIT 1
);

-- name: DeleteExpiredSessions :exec
DELETE FROM sessions
WHERE expires_at < NOW();
