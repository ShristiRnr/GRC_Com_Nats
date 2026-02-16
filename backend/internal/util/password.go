package util

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword returns the bcrypt hash of the password using the provided cost
func HashPassword(password string, cost int) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

// CheckPassword checks if the provided password matches the hashed password
func CheckPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// CheckPasswordWithTimingProtection matches passwords while preventing timing-based username enumeration.
// It always performs a bcrypt comparison, even if the user or hash is missing.
func CheckPasswordWithTimingProtection(password, hashedPassword string, dummyHash string) error {
	hashToCompare := hashedPassword
	if hashedPassword == "" {
		hashToCompare = dummyHash
	}
	
	err := bcrypt.CompareHashAndPassword([]byte(hashToCompare), []byte(password))
	
	if hashedPassword == "" {
		return bcrypt.ErrMismatchedHashAndPassword // Always return mismatch if we used dummy
	}
	return err
}

// HashRefreshToken hashes a refresh token using bcrypt
// Since refresh tokens can be longer than 72 bytes (bcrypt limit),
// we hash them with SHA256 first to get a fixed length string.
func HashRefreshToken(token string) (string, error) {
	// 1. SHA256 hash the token to get a fixed 64-char hex string
	shasum := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(shasum[:])

	// 2. Bcrypt the SHA256 hash
	hashedToken, err := bcrypt.GenerateFromPassword([]byte(tokenHash), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash refresh token: %w", err)
	}
	return string(hashedToken), nil
}

// CheckRefreshToken checks if the provided refresh token matches the hash
func CheckRefreshToken(token string, hashedToken string) error {
	// 1. SHA256 hash the input token
	shasum := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(shasum[:])

	// 2. Compare bcrypt hash with the SHA256 hash
	return bcrypt.CompareHashAndPassword([]byte(hashedToken), []byte(tokenHash))
}
