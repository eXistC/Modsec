package auth

import (
	"Modsec/clientside/CipherAlgo/keymaster"
	"Modsec/clientside/CipherAlgo/utils"
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
)

// LoginPayload represents login data sent to the backend
type LoginPayload struct {
	Email     string `json:"email"` //Encrypt with Publickey
	HqT       string `json:"hqt"`
	Hq1_HqR   string `json:"hq1-hqr"`
	Timestamp string `json:"timestamp"`
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

	keymaster.Masterkey = utils.MasterPasswordGen(password, email) // Forgot too added in first place

	// Get Sandwich components for login
	ArrayHq1_HqR, iterations := utils.SandwichLoginOP(password, email)

	// Generate timestamp
	timestamp := utils.GenerateTimestamp()

	// Convert Answer bytes to base64 strings
	Hq1_HqR := make([]string, len(ArrayHq1_HqR))
	for i, b := range ArrayHq1_HqR {
		Hq1_HqR[i] = utils.BytToBa64(b)
	}

	// Convert random numbers to strings for HqT creation
	result := make([]string, len(iterations))
	for i, num := range iterations {
		result[i] = strconv.Itoa(num)
		fmt.Print("Resutlfrom I =", result[i])
	}

	// Combine values for HqT
	packHqT := utils.ConCombineTime(Hq1_HqR, result, timestamp)

	// Generate final HqT value
	output := utils.Argon2Function(packHqT, nil, 32)
	finalHqT := utils.BytToBa64(output)
	comHq1_HqR := strings.Join(Hq1_HqR, "|")

	//get iteration hash into 32 bytes for Key
	sq := utils.SHA256Function([]byte(strings.Join(result, "|")))
	fmt.Println("Salt/Key:", sq)

	publickey, err := PubKeyRequest()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Publickey: %v", err)
	}

	encryptedEmail, err := utils.EncryptWithPublicKey(publickey, []byte(email))
	if err != nil {
		return nil, fmt.Errorf("failed to Encrpyt with Publickey: %v", err)
	}

	ConvertedEnEmail := utils.BytToBa64(encryptedEmail)

	// Create login payload
	payload := &LoginPayload{
		Email:     ConvertedEnEmail,
		HqT:       finalHqT,
		Hq1_HqR:   comHq1_HqR,
		Timestamp: timestamp,
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
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Access-Control-Allow-Credentials", "true")

	//Delete after test
	fmt.Println("Login data:", req)

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		// Read the error response body for more information
		bodyBytes, err := io.ReadAll(resp.Body)
		if err == nil && len(bodyBytes) > 0 {
			// Try to parse the error message
			var errorResponse map[string]interface{}
			if err := json.Unmarshal(bodyBytes, &errorResponse); err == nil {
				if msg, ok := errorResponse["message"].(string); ok && msg != "" {
					return nil, fmt.Errorf("%s", msg)
				}
			}

			// If we couldn't parse it as JSON, check if it contains "Password not match"
			bodyStr := string(bodyBytes)
			if strings.Contains(bodyStr, "Password not match") {
				return nil, fmt.Errorf("Password not match")
			}

			// Return the raw body as the error message if nothing else works
			if len(bodyStr) > 0 {
				return nil, fmt.Errorf(bodyStr)
			}
		}

		// Fall back to status code error if we couldn't get anything better
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
	backendURL := "http://localhost:8080/login"
	response, err := SendLoginToBackend(payload, backendURL)
	if err != nil {
		log.Printf("Login communication failed: %v", err)
		return nil, err
	}

	EncryptedVaultByte, err := utils.Ba64ToByt(response.EncryptedVault)
	if err != nil {
		log.Printf("Change base64 to byte failed: %v", err)
		return nil, err
	}

	// This is where the wrong password error often occurs - add more detailed logging
	log.Printf("Attempting to decrypt vault key with master key")
	keymaster.Vaultkey, err = utils.DecryptAES256GCM(EncryptedVaultByte, keymaster.Masterkey)
	if err != nil {
		log.Printf("Failed to decrypt vault key: %v", err)
		// Return a clearer error message for wrong password
		return nil, fmt.Errorf("incorrect password")
	}

	// Log success and return result
	log.Printf("Login result: %v - %s", response.Success, response.Message)
	return response, nil
}
