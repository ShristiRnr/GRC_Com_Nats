package db

import (
	"context"
	"fmt"
	"os"
	"testing"

	"grc-compil/backend/internal/util"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestRLSIsolation(t *testing.T) {
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres:shristi@localhost:5435/grc_db?sslmode=disable"
	}

	connPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		t.Skipf("skipping integration test: cannot connect to db: %v", err)
	}
	defer connPool.Close()

	// Initial store for seeding (as superuser)
	store := NewStore(connPool)

	// 1. Create a non-superuser for the test to avoid superuser bypass of RLS
	testUser := "rls_test_user_" + uuid.New().String()[:8]
	_, err = connPool.Exec(context.Background(), fmt.Sprintf("CREATE USER %s WITH PASSWORD 'password'", testUser))
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}
	defer connPool.Exec(context.Background(), fmt.Sprintf("DROP USER IF EXISTS %s", testUser))

	_, err = connPool.Exec(context.Background(), fmt.Sprintf("GRANT ALL ON TABLE risks TO %s", testUser))
	_, err = connPool.Exec(context.Background(), fmt.Sprintf("GRANT ALL ON TABLE organizations TO %s", testUser))
	_, err = connPool.Exec(context.Background(), fmt.Sprintf("GRANT EXECUTE ON FUNCTION public.get_current_org_id() TO %s", testUser))

	// Re-connect as the test user
	newDBURL := dbURL
	// Replace user/pass in URL (Simplified for this environment)
	newDBURL = "postgresql://" + testUser + ":password@localhost:5435/grc_db?sslmode=disable"
	
	testConnPool, err := pgxpool.New(context.Background(), newDBURL)
	if err != nil {
		t.Fatalf("failed to connect as test user: %v", err)
	}
	defer testConnPool.Close()
	
	store = NewStore(testConnPool)

	// 2. Create two test organizations
	orgA_ID := uuid.New()
	orgB_ID := uuid.New()

	var pgOrgA_ID, pgOrgB_ID pgtype.UUID
	pgOrgA_ID.Scan(orgA_ID.String())
	pgOrgB_ID.Scan(orgB_ID.String())

	// Insert organizations manually
	_, err = connPool.Exec(context.Background(), "INSERT INTO organizations (id, name) VALUES ($1, $2), ($3, $4) ON CONFLICT DO NOTHING", pgOrgA_ID, "RLS Test Org A", pgOrgB_ID, "RLS Test Org B")
	if err != nil {
		t.Fatalf("failed to seed orgs: %v", err)
	}
	defer connPool.Exec(context.Background(), "DELETE FROM organizations WHERE id IN ($1, $2)", pgOrgA_ID, pgOrgB_ID)

	// 2. Insert a Risk for Org B
	riskTitle := "RLS Test Risk for Org B"
	riskID := uuid.New()
	var pgRiskID pgtype.UUID
	pgRiskID.Scan(riskID.String())

	_, err = connPool.Exec(context.Background(), 
		"INSERT INTO risks (id, org_id, title, status, inherent_impact, inherent_likelihood) VALUES ($1, $2, $3, $4, $5, $6)",
		pgRiskID, pgOrgB_ID, riskTitle, "open", 1, 1)
	if err != nil {
		t.Fatalf("failed to seed risk: %v", err)
	}
	defer connPool.Exec(context.Background(), "DELETE FROM risks WHERE id = $1", pgRiskID)

	// 3. ATTEMPT TO FETCH AS ORG A (Model 2 Isolation Check)
	// Even though SQL is "SELECT * FROM risks WHERE id = $1", RLS should add "AND org_id = 'OrgA'"
	ctxA := util.InjectRLSContext(context.Background(), orgA_ID.String())

	_, err = store.GetRisk(ctxA, pgRiskID)
	
	// ERROR: If RLS works, it should return 'no rows in result set' (404-ish at DB level)
	if err == nil {
		t.Errorf("🚨 SECURITY BREACH: Org A was able to fetch Org B's risk %v. Model 2 RLS is NOT functioning!", riskID)
	} else {
		fmt.Printf("✅ Isolation Success: Org A access to Org B data blocked as expected.\n")
	}

	// 4. ATTEMPT TO FETCH AS ORG B (Correct Access Check)
	ctxB := util.InjectRLSContext(context.Background(), orgB_ID.String())
	risk, err := store.GetRisk(ctxB, pgRiskID)
	if err != nil {
		t.Errorf("❌ Failed to fetch risk as authorized org: %v", err)
	} else if risk.Title != riskTitle {
		t.Errorf("❌ Fetched wrong risk: expected %s, got %s", riskTitle, risk.Title)
	} else {
		fmt.Printf("✅ Access Granted: Org B correctly fetched its own risk: %s\n", risk.Title)
	}
}
