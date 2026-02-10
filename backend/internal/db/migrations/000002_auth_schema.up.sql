-- Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add org_id to users and other auth fields
ALTER TABLE users 
ADD COLUMN org_id UUID REFERENCES organizations(id),
ADD COLUMN password_hash TEXT NOT NULL DEFAULT '',
ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Add org_id to tasks for multi-tenant isolation
ALTER TABLE tasks
ADD COLUMN org_id UUID REFERENCES organizations(id);

-- Migration completed: No default organization seeded. 
-- Organization and Super Admin will be created via the /setup flow.

