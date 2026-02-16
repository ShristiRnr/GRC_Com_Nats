-- migration: 000013_security_rbac.up.sql

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g., 'assets.create'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions join table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Add role_id to users (if not already using role names)
-- For now, let's keep the role string in users but we can also link to the roles table.
-- The blueprint suggests checking specific permissions.

-- RLS Helper Functions
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS bigint AS $$
BEGIN
  RETURN nullif(current_setting('app.current_user_id', true), '')::bigint;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current org id
CREATE OR REPLACE FUNCTION public.get_current_org_id() 
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.current_org_id', true), '')::uuid;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on core tables (example)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

-- Default isolation policies
CREATE POLICY "Org isolation for assets" ON assets
    USING (org_id = public.get_current_org_id());

CREATE POLICY "Org isolation for tasks" ON tasks
    USING (org_id = public.get_current_org_id());

CREATE POLICY "Org isolation for risks" ON risks
    USING (org_id = public.get_current_org_id());

-- Seed some default roles and permissions
INSERT INTO roles (name, description) VALUES 
('admin', 'Organization Administrator'),
('editor', 'Content Editor'),
('viewer', 'Read-only Access')
ON CONFLICT (name) DO NOTHING;
