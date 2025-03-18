package utils

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

func ConCombineTime(arr1, arr2 []string, time string) string {
	combined := append(arr1, arr2...)
	combined = append(combined, time)
	return strings.Join(combined, "|")
}

func ConAnsSalt(arr1, arr2 []string) string {
	combined := append(arr1, arr2...)
	return strings.Join(combined, "|")
}

func SplitCombineTime(concatenated string) ([]string, []string, string, error) {
	parts := strings.Split(concatenated, "|")

	// Ensure the input has the expected number of elements (17 total)
	if len(parts) != 17 {
		fmt.Println("Input string must contain exactly 17 elements")
		return nil, nil, "error", nil
	}

	arr1 := parts[:8]   // First 8 elements
	arr2 := parts[8:16] // Next 8 elements
	time := parts[16]   // Last element (1 element)

	// Return the 3 arrays
	return arr1, arr2, time, nil
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
