-- Migration to add notifications table and RLS
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" bigint NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "org_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text NOT NULL, -- 'info', 'warning', 'error', 'success'
    "link" text,
    "is_read" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;

-- Policy for organization isolation
CREATE POLICY notifications_isolation_policy ON "notifications"
    FOR ALL
    USING (org_id = public.get_current_org_id());

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_notifications_user_org" ON "notifications" ("user_id", "org_id", "is_read");
