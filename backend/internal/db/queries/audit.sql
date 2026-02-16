-- name: CreateAuditLog :one
INSERT INTO audit_logs (
    user_id,
    org_id,
    event_type,
    event_data,
    ip_address,
    user_agent
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: ListAuditLogs :many
SELECT * FROM audit_logs
WHERE 
    (user_id = sqlc.narg('user_id') OR sqlc.narg('user_id') IS NULL) AND
    (org_id = sqlc.narg('org_id') OR sqlc.narg('org_id') IS NULL) AND
    (event_type = sqlc.narg('event_type') OR sqlc.narg('event_type') IS NULL)
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetAuditLog :one
SELECT * FROM audit_logs
WHERE id = $1 LIMIT 1;

-- name: DeleteOldAuditLogs :exec
DELETE FROM audit_logs
WHERE created_at < NOW() - ($1::int * INTERVAL '1 day');
