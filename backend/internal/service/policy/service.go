package policy

import (
	"context"
	"fmt"
	"sync"
	"time"

	db "grc-compil/backend/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreatePolicyRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type CreateClauseRequest struct {
	PolicyID  string `json:"policy_id"`
	ClauseID  string `json:"clause_id"`
	Content   string `json:"content"`
	ControlID string `json:"control_id"`
}

type PolicyService interface {
	CreatePolicy(ctx context.Context, req CreatePolicyRequest) (*db.Policy, error)
	ListPolicies(ctx context.Context) ([]db.Policy, error)
	GetPolicy(ctx context.Context, id string) (*db.Policy, error)
	DeletePolicy(ctx context.Context, id string) error
	CreateClause(ctx context.Context, req CreateClauseRequest) (*db.PolicyClause, error)
	ListClauses(ctx context.Context, policyID string) ([]db.PolicyClause, error)
}

var (
	mockPolicies = make(map[string]db.Policy)
	mockClauses  = make(map[string][]db.PolicyClause)
	mu           sync.Mutex
)

func init() {
	// Seed mock policies
	p1ID := "p1-uuid-1111-1111-111111111111"
	p2ID := "p2-uuid-2222-2222-222222222222"

	mockPolicies[p1ID] = db.Policy{
		ID:           createUUID(p1ID),
		Title:        "Data Retention Policy",
		Status:       "active",
		Content:      text("This policy defines how long data is stored."),
		Version:      text("v1.0"),
		LastReviewed: timestamptz(time.Now().AddDate(0, -6, 0)),
		NextReview:   timestamptz(time.Now().AddDate(0, 6, 0)),
		CreatedAt:    timestamptz(time.Now().AddDate(-1, 0, 0)),
	}

	mockPolicies[p2ID] = db.Policy{
		ID:           createUUID(p2ID),
		Title:        "Access Control Policy",
		Status:       "draft",
		Content:      text("Policies for access management."),
		Version:      text("v0.1"),
		LastReviewed: timestamptz(time.Now().AddDate(0, -1, 0)),
		NextReview:   timestamptz(time.Now().AddDate(0, 11, 0)),
		CreatedAt:    timestamptz(time.Now()),
	}
}

type policyService struct {
	store db.Querier
}

func NewPolicyService(store db.Querier) PolicyService {
	return &policyService{store: store}
}

func (s *policyService) CreatePolicy(ctx context.Context, req CreatePolicyRequest) (*db.Policy, error) {
	mu.Lock()
	defer mu.Unlock()

	id := createRandomUUIDString()
	p := db.Policy{
		ID:           createUUID(id),
		Title:        req.Title,
		Content:      text(req.Content),
		Status:       "draft",
		Version:      text("v1.0"),
		LastReviewed: timestamptz(time.Now()),
		NextReview:   timestamptz(time.Now().AddDate(1, 0, 0)),
		CreatedAt:    timestamptz(time.Now()),
		UpdatedAt:    timestamptz(time.Now()),
	}

	mockPolicies[id] = p
	return &p, nil
}

func (s *policyService) ListPolicies(ctx context.Context) ([]db.Policy, error) {
	mu.Lock()
	defer mu.Unlock()

	var result []db.Policy
	for _, p := range mockPolicies {
		result = append(result, p)
	}
	return result, nil
}

func (s *policyService) GetPolicy(ctx context.Context, id string) (*db.Policy, error) {
	mu.Lock()
	defer mu.Unlock()

	if p, ok := mockPolicies[id]; ok {
		return &p, nil
	}
	return nil, fmt.Errorf("policy not found")
}

func (s *policyService) DeletePolicy(ctx context.Context, id string) error {
	mu.Lock()
	defer mu.Unlock()

	if _, ok := mockPolicies[id]; !ok {
		return fmt.Errorf("policy not found")
	}
	delete(mockPolicies, id)
	delete(mockClauses, id)
	return nil
}

func (s *policyService) CreateClause(ctx context.Context, req CreateClauseRequest) (*db.PolicyClause, error) {
	mu.Lock()
	defer mu.Unlock()

	pUUID := createUUID(req.PolicyID)
	cUUID := createUUID(req.ControlID)
	id := createRandomUUIDString()

	clause := db.PolicyClause{
		ID:        createUUID(id),
		PolicyID:  pUUID,
		ClauseID:  req.ClauseID,
		Content:   text(req.Content),
		ControlID: cUUID,
		CreatedAt: timestamptz(time.Now()),
	}

	mockClauses[req.PolicyID] = append(mockClauses[req.PolicyID], clause)
	return &clause, nil
}

func (s *policyService) ListClauses(ctx context.Context, policyID string) ([]db.PolicyClause, error) {
	mu.Lock()
	defer mu.Unlock()

	clauses, ok := mockClauses[policyID]
	if !ok {
		return []db.PolicyClause{}, nil
	}

	// Enrich with mock controls if needed
	// In a real app this would be a join
	enriched := make([]db.PolicyClause, len(clauses))
	copy(enriched, clauses)

	// Since we are using mock data, we need to manually link control if present
	// We'll rely on the service layer to know about framework mocks too or just return as is
	// For now, let's keep it simple and just return what we have.
	// But if we want to BE exact, we'd need access to framework's mock store.

	return enriched, nil
}

// Helpers
func createUUID(s string) pgtype.UUID {
	var id pgtype.UUID
	_ = id.Scan(s)
	return id
}

func text(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}

func timestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func createRandomUUIDString() string {
	return fmt.Sprintf("p-%d", time.Now().UnixNano())
}
