package auth

import (
	"Modsec/clientside/client"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
)

// LoginPayload represents login data sent to the backend
type LogoutPayload struct {
	Email      string `json:"email"`
	HqT        string `json:"hqt"`
	Hq1_HqR    string `json:"hq1-hqr"`
	Timestamp  string `json:"timestamp"`
	Sessionkey string `json:"sessionkey"`
	IV         []byte `json:"iv"`
}

// LoginResponse represents the backend's response to login
type LogoutResponse struct {
	Success        bool   `json:"success"`
	Message        string `json:"message"`
	SessionToken   string `json:"session_token,omitempty"`
	EncryptedVault string `json:"encrypted_vault,omitempty"`
	// Add other fields as needed
}

func ClearAuthCookie(domain string, cookieName string) {
	if client.HMClient == nil || client.HMClient.Jar == nil {
		return
	}

	u, err := url.Parse(domain)
	if err != nil {
		return
	}

	// Overwrite with expired cookie
	expiredCookie := &http.Cookie{
		Name:   cookieName,
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	}
	client.HMClient.Jar.SetCookies(u, []*http.Cookie{expiredCookie})
}

func SendLogoutToBackend(backendURL string) (*LogoutResponse, error) {
	// Optional: include logout payload (if needed)
	// For now, just send an empty POST request
	req, err := http.NewRequest("POST", backendURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create logout request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Access-Control-Allow-Credentials", "true") // Optional

	// Perform request
	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("logout failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result LogoutResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}
	return &result, nil
}

func LogoutUser() (*LogoutResponse, error) {
	backendURL := "http://localhost:8080/logout" // Change as needed
	response, err := SendLogoutToBackend(backendURL)
	if err != nil {
		log.Printf("Login communication failed: %v", err)
		return nil, err
	}
	// Clear client cookie manually
	ClearAuthCookie("http://localhost:8080", "auth_token")

	// Log success and return result
	log.Printf("Logout result: %v - %s", response.Success, response.Message)
	return response, nil
}
