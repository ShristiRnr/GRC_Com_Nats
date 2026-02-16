-- migration: 000016_rls_force.up.sql

-- 1. Ensure all core tables have org_id
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE controls ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE asset_controls ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE program_frameworks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- 2. Enable RLS on all tables that should be isolated
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_clauses ENABLE ROW LEVEL SECURITY;

-- 3. Create Org Isolation Policies for newly enabled tables
-- (Note: assets, tasks, risks already have policies from 000013)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for frameworks') THEN
        CREATE POLICY "Org isolation for frameworks" ON frameworks USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for controls') THEN
        CREATE POLICY "Org isolation for controls" ON controls USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for programs') THEN
        CREATE POLICY "Org isolation for programs" ON programs USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for asset_controls') THEN
        CREATE POLICY "Org isolation for asset_controls" ON asset_controls USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for evidence') THEN
        CREATE POLICY "Org isolation for evidence" ON evidence USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for departments') THEN
        CREATE POLICY "Org isolation for departments" ON departments USING (org_id = public.get_current_org_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org isolation for policies') THEN
        CREATE POLICY "Org isolation for policies" ON policies USING (org_id = public.get_current_org_id());
    END IF;
END $$;

-- 4. FORCE RLS to ensure security even for superusers/owners
ALTER TABLE assets FORCE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE risks FORCE ROW LEVEL SECURITY;
ALTER TABLE frameworks FORCE ROW LEVEL SECURITY;
ALTER TABLE controls FORCE ROW LEVEL SECURITY;
ALTER TABLE programs FORCE ROW LEVEL SECURITY;
ALTER TABLE asset_controls FORCE ROW LEVEL SECURITY;
ALTER TABLE evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
ALTER TABLE asset_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE asset_types FORCE ROW LEVEL SECURITY;
ALTER TABLE policies FORCE ROW LEVEL SECURITY;
ALTER TABLE policy_clauses FORCE ROW LEVEL SECURITY;
