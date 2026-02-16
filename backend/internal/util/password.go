package util

import (
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
func HashRefreshToken(token string) (string, error) {
	// For tokens, we can use DefaultCost as they are long-lived and high entropy already,
	// but using the configured cost for consistency is also fine.
	hashedToken, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash refresh token: %w", err)
	}
	return string(hashedToken), nil
}

// CheckRefreshToken checks if the provided refresh token matches the hash
func CheckRefreshToken(token string, hashedToken string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedToken), []byte(token))
}
