-- name: CreateUser :one
INSERT INTO users (username, email, org_id, password_hash, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;


-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: ListUsersByOrg :many
SELECT * FROM users
WHERE org_id = $1
ORDER BY id;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY username;


-- name: CreateUserWithVerification :one
INSERT INTO users (username, email, org_id, password_hash, role, email_verified, verification_token, verification_token_expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: VerifyUserEmail :one
UPDATE users
SET email_verified = true, verification_token = NULL, verification_token_expires_at = NULL
WHERE verification_token = $1 AND verification_token_expires_at > NOW()
RETURNING *;

-- name: GetUserByVerificationToken :one
SELECT * FROM users WHERE verification_token = $1 LIMIT 1;

-- name: UpdateVerificationToken :one
UPDATE users
SET verification_token = $1, verification_token_expires_at = $2
WHERE id = $3
RETURNING *;
