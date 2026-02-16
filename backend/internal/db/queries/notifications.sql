-- name: CreateNotification :one
INSERT INTO notifications (
    user_id,
    org_id,
    title,
    message,
    type,
    link
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: ListNotificationsByUser :many
SELECT * FROM notifications
WHERE user_id = $1 AND org_id = $2
ORDER BY created_at DESC;

-- name: MarkNotificationAsRead :one
UPDATE notifications
SET is_read = true
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: GetUnreadCount :one
SELECT count(*) FROM notifications
WHERE user_id = $1 AND org_id = $2 AND is_read = false;

-- name: MarkAllAsRead :exec
UPDATE notifications
SET is_read = true
WHERE user_id = $1 AND org_id = $2 AND is_read = false;
