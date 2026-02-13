package db

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

type MockQuerier struct{}

func (m *MockQuerier) AddFrameworkToProgram(ctx context.Context, arg AddFrameworkToProgramParams) (ProgramFramework, error) {
	return ProgramFramework{}, errors.New("mock db error")
}

func (m *MockQuerier) AddScopeToProgram(ctx context.Context, arg AddScopeToProgramParams) (ProgramScope, error) {
	return ProgramScope{}, errors.New("mock db error")
}

func (m *MockQuerier) AssignTaskActors(ctx context.Context, arg AssignTaskActorsParams) (Task, error) {
	return Task{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateAsset(ctx context.Context, arg CreateAssetParams) (Asset, error) {
	return Asset{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateControl(ctx context.Context, arg CreateControlParams) (Control, error) {
	return Control{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateDepartment(ctx context.Context, arg CreateDepartmentParams) (Department, error) {
	return Department{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateEvidence(ctx context.Context, arg CreateEvidenceParams) (Evidence, error) {
	return Evidence{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateFramework(ctx context.Context, arg CreateFrameworkParams) (Framework, error) {
	return Framework{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateOrganization(ctx context.Context, name string) (Organization, error) {
	return Organization{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateProgram(ctx context.Context, arg CreateProgramParams) (Program, error) {
	return Program{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateRisk(ctx context.Context, arg CreateRiskParams) (Risk, error) {
	return Risk{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateSession(ctx context.Context, arg CreateSessionParams) (Session, error) {
	return Session{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateTask(ctx context.Context, arg CreateTaskParams) (Task, error) {
	return Task{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) CreateUserWithVerification(ctx context.Context, arg CreateUserWithVerificationParams) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) DeleteAsset(ctx context.Context, id pgtype.UUID) error {
	return errors.New("mock db error")
}

func (m *MockQuerier) DeleteRisk(ctx context.Context, id pgtype.UUID) error {
	return errors.New("mock db error")
}

func (m *MockQuerier) DeleteSession(ctx context.Context, id pgtype.UUID) error {
	return errors.New("mock db error")
}

func (m *MockQuerier) GetAsset(ctx context.Context, id pgtype.UUID) (Asset, error) {
	return Asset{}, errors.New("mock db error")
}

func (m *MockQuerier) GetDepartment(ctx context.Context, id pgtype.UUID) (Department, error) {
	return Department{}, errors.New("mock db error")
}

func (m *MockQuerier) GetFramework(ctx context.Context, id pgtype.UUID) (Framework, error) {
	return Framework{}, errors.New("mock db error")
}

func (m *MockQuerier) GetOrganization(ctx context.Context, id pgtype.UUID) (Organization, error) {
	return Organization{}, errors.New("mock db error")
}

func (m *MockQuerier) GetProgram(ctx context.Context, id pgtype.UUID) (Program, error) {
	return Program{}, errors.New("mock db error")
}

func (m *MockQuerier) GetRisk(ctx context.Context, id pgtype.UUID) (Risk, error) {
	return Risk{}, errors.New("mock db error")
}

func (m *MockQuerier) GetSession(ctx context.Context, id pgtype.UUID) (Session, error) {
	return Session{}, errors.New("mock db error")
}

func (m *MockQuerier) GetSystemConfig(ctx context.Context, key string) (SystemConfig, error) {
	return SystemConfig{}, errors.New("mock db error")
}

func (m *MockQuerier) GetTask(ctx context.Context, id pgtype.UUID) (Task, error) {
	return Task{}, errors.New("mock db error")
}

func (m *MockQuerier) GetUser(ctx context.Context, id int64) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) GetUserByEmail(ctx context.Context, email string) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) GetUserByUsername(ctx context.Context, username string) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) GetUserByVerificationToken(ctx context.Context, verificationToken pgtype.Text) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) LinkRiskToControl(ctx context.Context, arg LinkRiskToControlParams) error {
	return errors.New("mock db error")
}

func (m *MockQuerier) ListAssetCategories(ctx context.Context) ([]AssetCategory, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListAssetTypes(ctx context.Context) ([]AssetType, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListAssets(ctx context.Context) ([]Asset, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListControlsByAsset(ctx context.Context, assetID pgtype.UUID) ([]ListControlsByAssetRow, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListControlsByFramework(ctx context.Context, frameworkID pgtype.UUID) ([]Control, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListDepartments(ctx context.Context) ([]Department, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListEvidenceByTask(ctx context.Context, taskID pgtype.UUID) ([]Evidence, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListFrameworks(ctx context.Context) ([]Framework, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListOrganizations(ctx context.Context) ([]Organization, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListPrograms(ctx context.Context) ([]Program, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListRiskControls(ctx context.Context, riskID pgtype.UUID) ([]RiskControl, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListRisksByOrg(ctx context.Context, orgID pgtype.UUID) ([]Risk, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListTasksByOrg(ctx context.Context, orgID pgtype.UUID) ([]Task, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListUsers(ctx context.Context) ([]User, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) ListUsersByOrg(ctx context.Context, orgID pgtype.UUID) ([]User, error) {
	return nil, errors.New("mock db error")
}

func (m *MockQuerier) MapAssetControl(ctx context.Context, arg MapAssetControlParams) (AssetControl, error) {
	return AssetControl{}, errors.New("mock db error")
}

func (m *MockQuerier) SetSystemConfig(ctx context.Context, arg SetSystemConfigParams) (SystemConfig, error) {
	return SystemConfig{}, errors.New("mock db error")
}

func (m *MockQuerier) UpdateAsset(ctx context.Context, arg UpdateAssetParams) (Asset, error) {
	return Asset{}, errors.New("mock db error")
}

func (m *MockQuerier) UpdateRisk(ctx context.Context, arg UpdateRiskParams) (Risk, error) {
	return Risk{}, errors.New("mock db error")
}

func (m *MockQuerier) UpdateSessionBlock(ctx context.Context, arg UpdateSessionBlockParams) (Session, error) {
	return Session{}, errors.New("mock db error")
}

func (m *MockQuerier) UpdateTaskStatus(ctx context.Context, arg UpdateTaskStatusParams) (Task, error) {
	return Task{}, errors.New("mock db error")
}

func (m *MockQuerier) UpdateVerificationToken(ctx context.Context, arg UpdateVerificationTokenParams) (User, error) {
	return User{}, errors.New("mock db error")
}

func (m *MockQuerier) VerifyUserEmail(ctx context.Context, verificationToken pgtype.Text) (User, error) {
	return User{}, errors.New("mock db error")
}
