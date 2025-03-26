package auth

import (
	"Modsec/clientside/CipherAlgo/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

// LoginPayload represents the data structure sent to the backend
type LoginPayload struct {
	EmailHash     string   `json:"emailHash"`
	PackHqT       string   `json:"packHqT"`
	PackHqPayload []string `json:"packHqPayload"`
}

// LoginResponse represents the server response
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token,omitempty"`
}

// ProcessLogin handles the login cryptography operations
func ProcessLogin(email, password string) (*LoginPayload, error) {
	// Perform all the cryptographic operations
	// Generate master key but use it in operations (removed unused variable warning)
	masterKey := utils.MasterPasswordGen(password)
	// Use masterKey in some operation to avoid unused variable warning
	_ = masterKey // Replace this with actual usage of masterKey if needed

	Answer, Ran := utils.SandwichLoginOP(password, email)
	EmailHashBytes := utils.EmailToSHA256(email)
	// Convert EmailHash to string format
	EmailHash := utils.BytToBa64(EmailHashBytes)

	// Generate timestamp
	Time := utils.GenerateTimestamp()

	// Convert Answer bytes to base64 strings
	BaseAnswer := make([]string, len(Answer))
	for i, b := range Answer {
		BaseAnswer[i] = utils.BytToBa64(b)
	}

	// Convert random numbers to strings for HqT creation
	result := make([]string, len(Ran))
	for i, num := range Ran {
		result[i] = strconv.Itoa(num)
	}

	// Create PackHqT
	PackHqT := utils.ConCombineTime(BaseAnswer, result, Time)
	Output := utils.Argon2Function(PackHqT, nil, 32)
	PackHqT = utils.BytToBa64(Output)

	// Create PackHqPayload - ensure it's a []string type
	rawPayload := utils.ConSaltsEmail(BaseAnswer, Time)
	PackHqPayload := []string{rawPayload} // Convert to []string slice

	// Create and return the payload
	return &LoginPayload{
		EmailHash:     EmailHash,
		PackHqT:       PackHqT,
		PackHqPayload: PackHqPayload,
	}, nil
}

// SendLoginToBackend sends login data to the backend server
func SendLoginToBackend(payload *LoginPayload, backendURL string) (*LoginResponse, error) {
	// Convert payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode JSON: %v", err)
	}

	// Send data to backend server
	req, err := http.NewRequest("POST", backendURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send login data to backend: %v", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("login failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result LoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// LoginUser combines processing and backend communication
func LoginUser(email, password string) (*LoginResponse, error) {
	// Create a login payload
	payload, err := ProcessLogin(email, password)
	if err != nil {
		log.Printf("Login processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/login" // Change as needed

	// Add debugging information
	log.Printf("Sending login request to %s", backendURL)

	response, err := SendLoginToBackend(payload, backendURL)
	if err != nil {
		log.Printf("Login communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("Login result: %v - %s", response.Success, response.Message)
	return response, nil
}
