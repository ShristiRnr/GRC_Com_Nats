-- Drop index
DROP INDEX IF EXISTS idx_users_verification_token;

-- Drop system_config table
DROP TABLE IF EXISTS system_config;

-- Remove email verification fields from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS verification_token_expires_at,
DROP COLUMN IF EXISTS verification_token,
DROP COLUMN IF EXISTS email_verified;
