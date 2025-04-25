package auth

import (
	"Modsec/clientside/client"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// SessionCheckResponse represents the backend's session check response
type SessionCheckResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Email   string `json:"email,omitempty"` // Optional: include if backend returns it
}

// SendSessionCheckToBackend sends a session check request
func SendSessionCheckToBackend(backendURL string) (*SessionCheckResponse, error) {
	req, err := http.NewRequest("POST", backendURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create session check request: %v", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Access-Control-Allow-Credentials", "true") // Ensure cookie is sent

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("session check failed with status: %d", resp.StatusCode)
	}

	var result SessionCheckResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode session check response: %v", err)
	}
	return &result, nil
}

// SessionCheckUser handles session verification flow
func SessionCheckUser() (*SessionCheckResponse, error) {
	backendURL := "http://localhost:8080/session/check" // Replace with actual endpoint
	response, err := SendSessionCheckToBackend(backendURL)
	if err != nil {
		log.Printf("Session check failed: %v", err)
		return nil, err
	}

	log.Printf("Session check result: %v - %s", response.Success, response.Message)
	return response, nil
}
