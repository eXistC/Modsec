package myConvert

import (
	"encoding/base64"
	"fmt"
	"strings"
)

func Ba64ToByt(base64Str string) ([]byte, error) {
	bytes, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64: %w", err)
	}
	return bytes, nil
}

func BytToBa64(bytes []byte) string {
	return base64.StdEncoding.EncodeToString(bytes)
}

func ConSaltsEmail(arrayStrings []string, email string) string {
	return strings.Join(arrayStrings, "|") + "|" + email
}

// Split concatenated string back into salts and email
func SplitSaltsEmail(concatenated string) ([]string, string, error) {
	parts := strings.Split(concatenated, "|")
	if len(parts) < 2 {
		return nil, "", fmt.Errorf("invalid concatenated format")
	}

	// The last element is the email, the rest are salts
	arrasy := parts[:len(parts)-1]
	email := parts[len(parts)-1]
	return arrasy, email, nil
}
