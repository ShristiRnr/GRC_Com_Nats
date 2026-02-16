-- migration: 000015_seed_permissions.up.sql

-- 1. Seed Permissions
INSERT INTO permissions (code, description) VALUES
('assets.read', 'View assets'),
('assets.write', 'Create and update assets'),
('assets.delete', 'Delete assets'),
('tasks.read', 'View tasks'),
('tasks.write', 'Manage tasks and status'),
('tasks.delete', 'Delete tasks'),
('risks.read', 'View risks'),
('risks.write', 'Create and update risks'),
('risks.delete', 'Delete risks'),
('controls.read', 'View controls'),
('controls.write', 'Manage controls and mappings'),
('controls.delete', 'Delete controls'),
('frameworks.read', 'View frameworks'),
('frameworks.write', 'Manage frameworks'),
('frameworks.delete', 'Delete frameworks'),
('policies.read', 'View policies'),
('policies.write', 'Manage policies and clauses'),
('policies.delete', 'Delete policies'),
('departments.read', 'View departments'),
('departments.write', 'Manage departments'),
('users.read', 'View users'),
('users.write', 'Manage user roles and access')
ON CONFLICT (code) DO NOTHING;

-- 2. Link Permissions to Roles
DO $$
DECLARE
    admin_id UUID;
    editor_id UUID;
    viewer_id UUID;
BEGIN
    SELECT id INTO admin_id FROM roles WHERE name = 'admin';
    SELECT id INTO editor_id FROM roles WHERE name = 'editor';
    SELECT id INTO viewer_id FROM roles WHERE name = 'viewer';

    -- Admin gets everything
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_id, id FROM permissions
    ON CONFLICT DO NOTHING;

    -- Editor gets most things (Read + Write, but not Delete or User management)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT editor_id, id FROM permissions 
    WHERE code NOT LIKE '%.delete' AND code NOT LIKE 'users.%'
    ON CONFLICT DO NOTHING;

    -- Viewer gets only Read
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT viewer_id, id FROM permissions 
    WHERE code LIKE '%.read'
    ON CONFLICT DO NOTHING;
END $$;
