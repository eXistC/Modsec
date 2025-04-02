package auth

import (
	"Modsec/clientside/CipherAlgo/utils"
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

// LoginPayload represents login data sent to the backend
type LoginPayload struct {
	Email      string `json:"email"`
	HqT        string `json:"hqt"`
	Hp1_HpR    string `json:"hq1-hqr"`
	Timestamp  string `json:"timestamp"`
	Sessionkey string `json:"sessionkey"`
	IV         []byte `json:"iv"`
}

// LoginResponse represents the backend's response to login
type LoginResponse struct {
	Success        bool   `json:"success"`
	Message        string `json:"message"`
	SessionToken   string `json:"session_token,omitempty"`
	EncryptedVault string `json:"encrypted_vault,omitempty"`
	// Add other fields as needed
}

// ProcessLogin handles the login logic
func ProcessLogin(email, password string) (*LoginPayload, error) {

	// Get Sandwich components for login
	ArrayHp1_HpR, iterations := utils.SandwichLoginOP(password, email)

	// Generate timestamp
	timestamp := utils.GenerateTimestamp()

	// Convert Answer bytes to base64 strings
	Hp1_HpR := make([]string, len(ArrayHp1_HpR))
	for i, b := range ArrayHp1_HpR {
		Hp1_HpR[i] = utils.BytToBa64(b)
	}

	// Convert random numbers to strings for HqT creation
	result := make([]string, len(iterations))
	for i, num := range iterations {
		result[i] = strconv.Itoa(num)
	}

	// Combine values for HqT
	packHqT := utils.ConCombineTime(Hp1_HpR, result, timestamp)

	// Generate final HqT value
	output := utils.Argon2Function(packHqT, nil, 32)
	finalHqT := utils.BytToBa64(output)
	comHp1_HpR := strings.Join(Hp1_HpR, "|")

	//get iteration hash into 32 bytes for Key
	sq32 := sha256.Sum256([]byte(strings.Join(result, "|")))
	sq := sq32[:]
	fmt.Println("Salt/Key:", sq)

	// Generate initialization vector
	iv, err := utils.GenerateIV()
	if err != nil {
		return nil, fmt.Errorf("failed to generate IV: %v", err)
	}

	sessionKey, err := utils.GenerateSessionKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate session key: %v", err)
	}

	// Encrypt session key with sq
	encryptedSessionkey, err := utils.EncryptAES256GCM(string(sessionKey), sq, iv)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt iterations: %v", err)
	}

	// Create login payload
	payload := &LoginPayload{
		Email:      email,
		HqT:        finalHqT,
		Hp1_HpR:    comHp1_HpR,
		Timestamp:  timestamp,
		Sessionkey: encryptedSessionkey,
		IV:         iv,
	}

	return payload, nil
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
	backendURL := "http://[::]:8080/login" // Change as needed
	response, err := SendLoginToBackend(payload, backendURL)
	if err != nil {
		log.Printf("Login communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("Login result: %v - %s", response.Success, response.Message)
	return response, nil
}
