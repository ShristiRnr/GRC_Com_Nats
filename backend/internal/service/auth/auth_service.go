package auth

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/audit"
	"grc-compil/backend/internal/util"
)

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrSessionBlocked     = errors.New("session is blocked")
	ErrIncorrectUser      = errors.New("incorrect user")
	ErrMismatchedToken    = errors.New("mismatched refresh token")
	ErrExpiredSession     = errors.New("session has expired")
)

type LoginResponse struct {
	AccessToken           string
	AccessTokenPayload    *util.TokenPayload
	RefreshToken          string
	RefreshTokenPayload   *util.TokenPayload
	User                  *db.User
}

type AuthService interface {
	Login(ctx context.Context, username, password string, userAgent, clientIP string) (*LoginResponse, error)
	Refresh(ctx context.Context, refreshToken string, userAgent, clientIP string) (*LoginResponse, error)
	Me(ctx context.Context, userID int64) (*db.User, error)
	IsSuperAdmin(user *db.User) bool
}

type authService struct {
	store                db.Store
	tokenMaker           util.TokenMaker
	audit                audit.AuditService
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
	maxSessions          int
	bcryptCost           int
	dummyHash           string
	superAdminRole       string
}

func NewAuthService(
	store db.Store, 
	tokenMaker util.TokenMaker, 
	audit audit.AuditService,
	accessTokenDuration time.Duration,
	refreshTokenDuration time.Duration,
	maxSessions int,
	bcryptCost int,
	superAdminRole string,
) AuthService {
	// SECURITY: Pre-generate dummy hash at startup to prevent timing attacks.
	// This ensures dummy comparison has the same cost as real comparison.
	dummyHash, _ := util.HashPassword("dummy-password", bcryptCost)

	return &authService{
		store:                store,
		tokenMaker:           tokenMaker,
		audit:                audit,
		accessTokenDuration:  accessTokenDuration,
		refreshTokenDuration: refreshTokenDuration,
		maxSessions:          maxSessions,
		bcryptCost:           bcryptCost,
		dummyHash:            dummyHash,
		superAdminRole:       superAdminRole,
	}
}

func (s *authService) Login(ctx context.Context, identifier, password string, userAgent, clientIP string) (*LoginResponse, error) {
	if identifier == "" || password == "" {
		return nil, errors.New("identifier and password are required")
	}

	// Try lookup by username first
	user, err := s.store.GetUserByUsername(ctx, identifier)
	if err != nil {
		// If username fails, try lookup by email
		user, err = s.store.GetUserByEmail(ctx, identifier)
		if err != nil {
			fmt.Printf("Auth fail: user not found '%s' from %s\n", identifier, clientIP)
			s.audit.LogEvent(ctx, nil, nil, "auth.login_failure", map[string]interface{}{"reason": "user_not_found", "identifier": identifier}, clientIP, userAgent)
			return nil, ErrInvalidCredentials
		}
	}

	// SECURITY: Constant time password comparison even if user not found.
	// This prevents username enumeration through timing differences.
	var passwordHash string
	if user.PasswordHash != "" {
		passwordHash = user.PasswordHash
	}

	err = util.CheckPasswordWithTimingProtection(password, passwordHash, s.dummyHash)
	if err != nil {
		fmt.Printf("Auth fail: password mismatch or user not found for '%s' from %s\n", identifier, clientIP)
		s.audit.LogEvent(ctx, &user.ID, nil, "auth.login_failure", map[string]interface{}{"reason": "invalid_credentials"}, clientIP, userAgent)
		return nil, ErrInvalidCredentials
	}

	// Check if email is verified
	if !user.EmailVerified {
		fmt.Printf("Auth fail: email not verified for user %s from %s\n", user.Email, clientIP)
		s.audit.LogEvent(ctx, &user.ID, nil, "auth.login_failure", map[string]interface{}{"reason": "email_not_verified"}, clientIP, userAgent)
		return nil, ErrInvalidCredentials // Generic for client
	}

	// Convert pgtype.UUID to string for token
	orgIDStr := ""
	if user.OrgID.Valid {
		orgIDStr = util.UUIDToString(user.OrgID.Bytes)
	}

	var loginRes *LoginResponse
	err = s.store.ExecTx(ctx, func(q *db.Queries) error {
		// 1. Enforce session limits
		// Count active sessions with lock to prevent race condition
		sessions, err := q.ListSessionsForUpdate(ctx, user.ID)
		if err != nil {
			return err
		}

		if len(sessions) >= s.maxSessions {
			// Evict oldest session
			err = q.DeleteOldestSession(ctx, user.ID)
			if err != nil {
				return err
			}
			s.audit.LogEvent(ctx, &user.ID, &orgIDStr, "auth.session_evicted", map[string]interface{}{"evicted_session_id": sessions[0].ID}, clientIP, userAgent)
		}

		// 2. Create session record
		session, err := q.CreateSession(ctx, db.CreateSessionParams{
			UserID:       user.ID,
			RefreshToken: "", // Will update this with hash
			UserAgent:    userAgent,
			ClientIp:     clientIP,
			IsBlocked:    false,
			ExpiresAt:    pgtype.Timestamptz{Time: time.Now().Add(s.refreshTokenDuration), Valid: true},
		})
		if err != nil {
			return err
		}

		// 2. Generate tokens with session ID
		var sessionID uuid.UUID
		copy(sessionID[:], session.ID.Bytes[:])

		accessToken, accessPayload, err := s.tokenMaker.CreateToken(
			strconv.FormatInt(user.ID, 10),
			orgIDStr,
			user.Email,
			sessionID,
			s.accessTokenDuration,
		)
		if err != nil {
			return err
		}

		refreshToken, refreshPayload, err := s.tokenMaker.CreateToken(
			strconv.FormatInt(user.ID, 10),
			orgIDStr,
			user.Email,
			sessionID,
			s.refreshTokenDuration,
		)
		if err != nil {
			return err
		}

		// SECURITY: Hash refresh token before storage
		hashedRefreshToken, err := util.HashRefreshToken(refreshToken)
		if err != nil {
			return err
		}

		// 3. Update session with hashed refresh token
		_, err = q.UpdateSessionRefreshToken(ctx, db.UpdateSessionRefreshTokenParams{
			ID:           session.ID,
			RefreshToken: hashedRefreshToken,
		})
		if err != nil {
			return err
		}

		loginRes = &LoginResponse{
			AccessToken:         accessToken,
			AccessTokenPayload:  accessPayload,
			RefreshToken:        refreshToken,
			RefreshTokenPayload: refreshPayload,
			User:                &user,
		}
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("login failed: %w", err)
	}

	s.audit.LogEvent(ctx, &user.ID, &orgIDStr, "auth.login_success", nil, clientIP, userAgent)
	return loginRes, nil
}

func (s *authService) Refresh(ctx context.Context, refreshToken string, userAgent, clientIP string) (*LoginResponse, error) {
	if refreshToken == "" {
		return nil, errors.New("refresh token is required")
	}

	refreshPayload, err := s.tokenMaker.VerifyToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	var sessionID pgtype.UUID
	copy(sessionID.Bytes[:], refreshPayload.SessionID[:])
	sessionID.Valid = true

	var refreshRes *LoginResponse
	err = s.store.ExecTx(ctx, func(q *db.Queries) error {
		// SECURITY: Row-level lock to prevent race conditions during rotation
		session, err := q.GetSessionForUpdate(ctx, sessionID)
		if err != nil {
			fmt.Printf("Refresh fail: session not found for ID %v from %s\n", sessionID, clientIP)
			return ErrInvalidCredentials
		}

		if session.IsBlocked {
			fmt.Printf("Refresh fail: blocked session %v from %s\n", sessionID, clientIP)
			return ErrInvalidCredentials
		}

		// SECURITY: Use bcrypt to check hashed refresh token
		err = util.CheckRefreshToken(refreshToken, session.RefreshToken)
		if err != nil {
			// This happens if an old token is reused. Potential attack.
			// Block the session immediately.
			_, _ = q.UpdateSessionBlock(ctx, db.UpdateSessionBlockParams{
				ID:        session.ID,
				IsBlocked: true,
			})
			fmt.Printf("REUSE DETECTED: session %v blocked due to token mismatch from %s\n", sessionID, clientIP)
			s.audit.LogEvent(ctx, &session.UserID, nil, "auth.token_reuse_detected", map[string]interface{}{"session_id": sessionID}, clientIP, userAgent)
			return ErrInvalidCredentials
		}

		if time.Now().After(session.ExpiresAt.Time) {
			fmt.Printf("Refresh fail: expired session %v from %s\n", sessionID, clientIP)
			return ErrInvalidCredentials
		}

		user, err := q.GetUser(ctx, session.UserID)
		if err != nil {
			return err
		}

		// Convert pgtype.UUID to string for token
		orgIDStr := ""
		if user.OrgID.Valid {
			orgIDStr = util.UUIDToString(user.OrgID.Bytes)
		}

		// Generate new tokens
		accessToken, accessPayload, err := s.tokenMaker.CreateToken(
			strconv.FormatInt(user.ID, 10),
			orgIDStr,
			user.Email,
			refreshPayload.SessionID,
			s.accessTokenDuration,
		)
		if err != nil {
			return err
		}

		newRefreshToken, newRefreshPayload, err := s.tokenMaker.CreateToken(
			strconv.FormatInt(user.ID, 10),
			orgIDStr,
			user.Email,
			refreshPayload.SessionID,
			s.refreshTokenDuration,
		)
		if err != nil {
			return err
		}

		// Hash new refresh token (Rotation)
		hashedNewRefreshToken, err := util.HashRefreshToken(newRefreshToken)
		if err != nil {
			return err
		}

		_, err = q.UpdateSessionRefreshToken(ctx, db.UpdateSessionRefreshTokenParams{
			ID:           session.ID,
			RefreshToken: hashedNewRefreshToken,
		})
		if err != nil {
			return err
		}

		refreshRes = &LoginResponse{
			AccessToken:         accessToken,
			AccessTokenPayload:  accessPayload,
			RefreshToken:        newRefreshToken,
			RefreshTokenPayload: newRefreshPayload,
			User:                &user,
		}
		return nil
	})

	if err != nil {
		return refreshRes, err
	}

	return refreshRes, nil
}

func (s *authService) Me(ctx context.Context, userID int64) (*db.User, error) {
	user, err := s.store.GetUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *authService) IsSuperAdmin(user *db.User) bool {
	return user.Role == s.superAdminRole
}
