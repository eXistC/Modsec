package auth

import (
	"Modsec/clientside/CipherAlgo/utils"
	"crypto/rand"
	"encoding/base64"
)

// Config holds authentication configuration
type Config struct {
	BackendURL string
}

var (
	// DefaultConfig holds default configuration values
	DefaultConfig = Config{
		BackendURL: "http://localhost:8080",
	}
)

// GenerateSessionToken creates a secure random token
func GenerateSessionToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}

// ValidateEmailFormat checks if the email format is valid
func ValidateEmailFormat(email string) bool {
	// Simple validation - can be expanded
	return utils.ValidateEmail(email)
}

// ValidatePasswordStrength checks if the password meets strength requirements
func ValidatePasswordStrength(password string) (bool, string) {
	if len(password) < 8 {
		return false, "Password must be at least 8 characters"
	}
	// Add more validation rules as needed
	return true, ""
}
