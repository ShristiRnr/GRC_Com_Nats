package util

import (
	"errors"
	"time"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken  = errors.New("token has expired")
)

// TokenPayload represents the payload of the JWT
type TokenPayload struct {
	ID        uuid.UUID `json:"id"`
	SessionID uuid.UUID `json:"session_id"` // Critical: Links to DB session
	UserID    string    `json:"sub"`
	OrgID     string    `json:"org_id"`
	// SECURITY: Role deliberately removed from JWT
	// Role must be fetched from database to prevent privilege escalation
	Email     string    `json:"email"`
	jwt.RegisteredClaims
}

// TokenMaker is an interface for managing tokens
type TokenMaker interface {
	CreateToken(userID, orgID, email string, sessionID uuid.UUID, duration time.Duration) (string, *TokenPayload, error)
	VerifyToken(token string) (*TokenPayload, error)
}

// JWTMaker is a struct that implements the TokenMaker interface
type JWTMaker struct {
	secretKey     []byte
	signingMethod jwt.SigningMethod
	issuer        string
	audience      string
}

// NewJWTMaker creates a new JWTMaker
func NewJWTMaker(secretKey string, algorithm string, issuer string, audience string) (TokenMaker, error) {
	var method jwt.SigningMethod
	switch algorithm {
	case "HS256":
		method = jwt.SigningMethodHS256
	case "HS384":
		method = jwt.SigningMethodHS384
	case "HS512":
		method = jwt.SigningMethodHS512
	default:
		return nil, fmt.Errorf("unsupported signing algorithm: %s", algorithm)
	}

	// SECURITY: Ensure secret key is long enough for the chosen algorithm
	// Minimum 32 bytes (256 bits) for HS256, 48 for HS384, 64 for HS512.
	minLen := 32
	if algorithm == "HS512" {
		minLen = 64
	}
	if len(secretKey) < minLen {
		return nil, fmt.Errorf("secret key too short: must be at least %d characters for %s", minLen, algorithm)
	}

	return &JWTMaker{
		secretKey:     []byte(secretKey),
		signingMethod: method,
		issuer:        issuer,
		audience:      audience,
	}, nil
}

// CreateToken creates a new token for a specific user
func (maker *JWTMaker) CreateToken(userID, orgID, email string, sessionID uuid.UUID, duration time.Duration) (string, *TokenPayload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return "", nil, err
	}

	payload := &TokenPayload{
		ID:        tokenID,
		SessionID: sessionID,
		UserID:    userID,
		OrgID:     orgID,
		// Role deliberately omitted - must be fetched from DB
		Email:     email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    maker.issuer,
			Audience:  []string{maker.audience},
		},
	}

	jwtToken := jwt.NewWithClaims(maker.signingMethod, payload)
	token, err := jwtToken.SignedString(maker.secretKey)
	return token, payload, err
}

// VerifyToken checks if the token is valid or not
func (maker *JWTMaker) VerifyToken(tokenString string) (*TokenPayload, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		// SECURITY: Strict algorithm validation to prevent algorithm confusion attacks
		if token.Method != maker.signingMethod {
			return nil, ErrInvalidToken
		}
		return maker.secretKey, nil
	}

	jwtToken, err := jwt.ParseWithClaims(tokenString, &TokenPayload{}, keyFunc)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	payload, ok := jwtToken.Claims.(*TokenPayload)
	if !ok {
		return nil, ErrInvalidToken
	}

	return payload, nil
}

// UUIDToString converts a 16-byte UUID to a standard string format
func UUIDToString(b [16]byte) string {
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
