-- Programs Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Frameworks
CREATE TABLE IF NOT EXISTS frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    version TEXT,
    status TEXT NOT NULL DEFAULT 'published', -- draft, published, archived
    control_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Controls
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'access_control', 'encryption'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(framework_id, code)
);

-- Assets (simplified for now)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'server', 'database', 'application', 'vendor'
    description TEXT,
    owner_id BIGINT REFERENCES users(id), -- Assuming simple user link for now
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asset Controls (Mapping)
CREATE TABLE IF NOT EXISTS asset_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    coverage_status TEXT DEFAULT 'planned', -- full, partial, planned, not_applicable
    implementation_notes TEXT,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, control_id)
);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- internal_audit, external_audit, assessment
    status TEXT NOT NULL DEFAULT 'planning', -- planning, active, completed, paused, closed
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program Frameworks (Many-to-Many)
CREATE TABLE IF NOT EXISTS program_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, framework_id)
);

-- Program Scope (Assets/Departments inclusion)
CREATE TABLE IF NOT EXISTS program_scope (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('department', 'asset')),
    resource_id UUID NOT NULL, -- ID of the asset or department
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, resource_type, resource_id)
);

-- Program Controls (Direct mapping of controls to program context tasks later)
-- For now, we assume program scope implies controls via frameworks + asset mappings.
