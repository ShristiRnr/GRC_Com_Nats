-- migration: 000014_security_hardening.up.sql

-- 1. Add indexes to sessions table for performance and to prevent DoS via slow lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- Note: id is already PRIMARY KEY, which has an implicit index.

-- 2. Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT, -- Nullable for pre-auth events (like failed login)
    org_id UUID,    -- Nullable
    event_type TEXT NOT NULL, -- e.g., 'login.success', 'login.failure', 'session.blocked', 'role.change'
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type_created_at ON audit_logs(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id_created_at ON audit_logs(org_id, created_at);

-- 3. Fix SECURITY DEFINER functions by setting search_path to prevent hijacking
-- These functions were created in 000013_security_rbac.up.sql

ALTER FUNCTION auth.uid() SET search_path = public, auth;
ALTER FUNCTION public.get_current_org_id() SET search_path = public;

-- 4. Review and update sessions table if needed
-- The refresh_token column is already TEXT, which is fine for storing bcrypt hashes.
-- bcrypt hashes are usually ~60 characters.
