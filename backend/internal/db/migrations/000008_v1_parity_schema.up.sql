-- v1 Parity Schema Alignment
-- Adds Risks, detailed Assets, and Task lifecycle tables

-- 1. Policies & Clauses
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    content TEXT,
    version TEXT DEFAULT 'v1.0',
    last_reviewed TIMESTAMPTZ DEFAULT NOW(),
    next_review TIMESTAMPTZ DEFAULT (NOW() + interval '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    clause_id TEXT NOT NULL,
    content TEXT,
    control_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Departments Update
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS org_id UUID,
ADD COLUMN IF NOT EXISTS head_user_id UUID,
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
DROP COLUMN IF EXISTS head_id;

-- 3. Risks Table
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    inherent_impact INT NOT NULL DEFAULT 1,
    inherent_likelihood INT NOT NULL DEFAULT 1,
    residual_impact INT,
    residual_likelihood INT,
    status TEXT NOT NULL DEFAULT 'identified',
    treatment_plan TEXT,
    owner_id UUID,
    source_task_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Assets Update & Related Tables
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS asset_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,
    name TEXT NOT NULL,
    category_id UUID REFERENCES asset_categories(id),
    description TEXT
);

ALTER TABLE assets
ADD COLUMN IF NOT EXISTS org_id UUID,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES asset_categories(id),
ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES asset_types(id),
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
ADD COLUMN IF NOT EXISTS criticality TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS confidentiality INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS integrity INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS availability INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT,
ADD COLUMN IF NOT EXISTS compliance_status TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
DROP COLUMN IF EXISTS owner_id; -- Migration to UUID owner_id
ALTER TABLE assets ADD COLUMN owner_id UUID;

-- 5. Tasks & Evidence
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    control_id UUID NOT NULL,
    asset_id UUID,
    owner_id UUID,
    reviewer_id UUID,
    assessor_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    result TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    org_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
