-- Up Migration: Convert Framework-Control relationship to Many-to-Many

-- 1. Add org_id to frameworks and controls for multi-tenancy
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE controls ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- 2. Create the Many-to-Many mapping table
CREATE TABLE IF NOT EXISTS framework_controls (
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (framework_id, control_id)
);

-- 3. Pre-populate org_id for existing frameworks/controls (optional if empty, but safe)
-- If org_id is NULL, we might want to default it to the first organization if one exists,
-- but since this is usually part of a setup flow, we'll leave it for now or assume they are empty.

-- 4. Move existing data from controls table to framework_controls
INSERT INTO framework_controls (framework_id, control_id)
SELECT framework_id, id FROM controls
WHERE framework_id IS NOT NULL;

-- 5. Drop the old relationship column and update constraints
ALTER TABLE controls DROP CONSTRAINT IF EXISTS controls_framework_id_fkey;
ALTER TABLE controls DROP COLUMN IF EXISTS framework_id;

-- 6. Update uniqueness: control code should be unique per organization
ALTER TABLE controls DROP CONSTRAINT IF EXISTS controls_framework_id_code_key;
ALTER TABLE controls ADD CONSTRAINT controls_org_id_code_key UNIQUE(org_id, code);
