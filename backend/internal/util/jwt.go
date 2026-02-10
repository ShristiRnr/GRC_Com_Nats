package util

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken  = errors.New("token has expired")
)

// TokenPayload represents the payload of the JWT
type TokenPayload struct {
	ID     uuid.UUID `json:"id"`
	UserID string    `json:"sub"`
	OrgID  string    `json:"org_id"`
	Role   string    `json:"role"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

// TokenMaker is an interface for managing tokens
type TokenMaker interface {
	CreateToken(userID, orgID, role, email string, duration time.Duration) (string, *TokenPayload, error)
	VerifyToken(token string) (*TokenPayload, error)
}

// JWTMaker is a struct that implements the TokenMaker interface
type JWTMaker struct {
	secretKey []byte
}

// NewJWTMaker creates a new JWTMaker
func NewJWTMaker(secretKey string) TokenMaker {
	return &JWTMaker{secretKey: []byte(secretKey)}
}

// CreateToken creates a new token for a specific user
func (maker *JWTMaker) CreateToken(userID, orgID, role, email string, duration time.Duration) (string, *TokenPayload, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return "", nil, err
	}

	payload := &TokenPayload{
		ID:     tokenID,
		UserID: userID,
		OrgID:  orgID,
		Role:   role,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "grc-compil-auth",
			Audience:  []string{"grc-compil-api"},
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	token, err := jwtToken.SignedString(maker.secretKey)
	return token, payload, err
}

// VerifyToken checks if the token is valid or not
func (maker *JWTMaker) VerifyToken(tokenString string) (*TokenPayload, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
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
