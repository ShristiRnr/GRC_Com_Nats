-- Down Migration: Revert many-to-many to one-to-many

-- 1. Add framework_id back to controls
ALTER TABLE controls ADD COLUMN IF NOT EXISTS framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE;

-- 2. Restore data (best effort: pick the first framework_id from the mapping table)
UPDATE controls c
SET framework_id = (
    SELECT framework_id 
    FROM framework_controls fc 
    WHERE fc.control_id = c.id 
    LIMIT 1
);

-- 3. Restore uniqueness constraint
ALTER TABLE controls DROP CONSTRAINT IF EXISTS controls_org_id_code_key;
ALTER TABLE controls ADD CONSTRAINT controls_framework_id_code_key UNIQUE(framework_id, code);

-- 4. Drop the Many-to-Many mapping table
DROP TABLE IF EXISTS framework_controls;

-- 5. Remove org_id if it wasn't there (though it's usually better to keep it, but for a strict 'down' we remove it)
-- ALTER TABLE frameworks DROP COLUMN IF EXISTS org_id;
-- ALTER TABLE controls DROP COLUMN IF EXISTS org_id;
