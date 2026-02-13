-- Control Details Parity Migration

-- 1. Create profiles table if it doesn't exist (v2 uses users but needs UUID profiles for parity with tasks/risks schemas)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns to controls table
ALTER TABLE controls 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES control_domains(id);

-- 3. Create control_evidence table (distinct from task evidence)
CREATE TABLE IF NOT EXISTS control_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    evidence_type TEXT DEFAULT 'document' NOT NULL, -- document, url, attestation
    file_name TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    external_url TEXT,
    checksum TEXT,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
