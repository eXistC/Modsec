package utils

import (
	"net/mail"
	"regexp"
	"strings"
)

// ValidateEmail checks if the email format is valid
func ValidateEmail(email string) bool {
	if email == "" {
		return false
	}

	// Basic format check using the standard library
	_, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}

	// Additional validation checks
	// 1. Check for minimum length
	if len(email) < 5 { // a@b.c is the minimum valid email
		return false
	}

	// 2. Check for domain part with at least one dot
	parts := strings.Split(email, "@")
	if len(parts) != 2 || !strings.Contains(parts[1], ".") {
		return false
	}

	// 3. Check that TLD is at least 2 characters
	domainParts := strings.Split(parts[1], ".")
	lastPart := domainParts[len(domainParts)-1]
	if len(lastPart) < 2 {
		return false
	}

	// 4. No consecutive dots
	if strings.Contains(email, "..") {
		return false
	}

	// 5. Additional regex for common patterns
	// This is a simplified regex, you might want to use a more comprehensive one
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}
