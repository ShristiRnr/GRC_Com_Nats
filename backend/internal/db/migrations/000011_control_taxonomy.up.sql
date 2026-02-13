-- Add Control Categories and Domains for v1 Parity

CREATE TABLE IF NOT EXISTS control_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS control_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update controls table to use category_id and domain_id (optional, or just keep category as text for compatibility)
-- v1 uses category as TEXT in the controls table sometimes, but also has a categories table.
-- Let's stick to v1 SCHEMA.md: 
-- controls table has "category TEXT"
-- but there's also a categories table.
-- Wait, let me check v1 Lib API again.
