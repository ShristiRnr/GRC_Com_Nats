-- Enhance Tasks for Workflow Parity
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS assessor_notes TEXT,
ADD COLUMN IF NOT EXISTS visible_to_assignee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'compliance',
ADD COLUMN IF NOT EXISTS evidence_required JSONB DEFAULT '{}'::jsonb;

-- Enhance Risks for Parity
ALTER TABLE risks
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS response_strategy TEXT,
ADD COLUMN IF NOT EXISTS mitigation_plan TEXT,
ADD COLUMN IF NOT EXISTS review_date DATE;

-- Risk Controls Mapping Table
CREATE TABLE IF NOT EXISTS risk_controls (
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID NOT NULL,
    effectiveness TEXT DEFAULT 'untested',
    notes TEXT,
    mapped_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (risk_id, control_id)
);
