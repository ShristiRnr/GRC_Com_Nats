package util

import (
	"context"
)

type contextKey string

const (
	rlsOrgIDKey contextKey = "rls_org_id"
)

// InjectRLSContext adds the orgID to the context for RLS enforcement
func InjectRLSContext(ctx context.Context, orgID string) context.Context {
	return context.WithValue(ctx, rlsOrgIDKey, orgID)
}

// ExtractRLSContext retrieves the orgID from the context for RLS enforcement
func ExtractRLSContext(ctx context.Context) (string, bool) {
	orgID, ok := ctx.Value(rlsOrgIDKey).(string)
	return orgID, ok
}
