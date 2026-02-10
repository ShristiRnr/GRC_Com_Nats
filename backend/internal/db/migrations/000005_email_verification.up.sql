-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN verification_token TEXT,
ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create system_config table for application-wide settings
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial setup flag (false = setup not completed)
INSERT INTO system_config (key, value) VALUES ('system_setup_completed', 'false');

-- Create index for faster token lookups
CREATE INDEX idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
