package auth

import (
	"Modsec/clientside/CipherAlgo/keymaster"
	"Modsec/clientside/CipherAlgo/utils"
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// RegisterResponse represents the response from the backend
type RecSetupResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type RecSetupPayload struct {
	HashEmail            string `json:"hashemail"`
	EncryptedRecoveryKey string `json:"encrypted_recoverykey"`
}

// ProcessRegistration handles the core recovery setup logic
func ProcessRecoverySetup(UserHashEmail, SeedPhrase string) (*RecSetupPayload, error) { // No use hash email for now

	Result := utils.ConcatKeyAndSeed(keymaster.Vaultkey, SeedPhrase)

	// Encrypt Recovery key with SeedPhrase
	// Result in Base64

	SeedToKey := utils.SHA256Function([]byte(SeedPhrase)) //Convert FIRST!!!!

	encryptedRecoveryKey, err := utils.EncryptAES256GCM([]byte(Result), SeedToKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Recovery key: %v", err)
	}

	// Create response data structure using DataStr.ResData
	payload := &RecSetupPayload{
		HashEmail:            UserHashEmail,
		EncryptedRecoveryKey: utils.BytToBa64(encryptedRecoveryKey),
	}

	return payload, nil
}

// sends Recovery setup data to the backend server
func SendRecoverySetupoBackend(payload *RecSetupPayload, backendURL string) (*RecSetupResponse, error) {
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

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("backend registration failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result RecSetupResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func RecoverySetup(email string) (string, error) {
	// Create a registration payload
	HashEmail := utils.BytToBa64(utils.EmailToSHA256(email))
	seedPhrase := utils.RandomSeedPhrase()
	payload, err := ProcessRecoverySetup(HashEmail, seedPhrase)
	if err != nil {
		log.Printf("Recovery setup processing failed: %v", err)
		return "", err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/recovery/setup" // Change as needed
	response, err := SendRecoverySetupoBackend(payload, backendURL)
	if err != nil {
		log.Printf("Recovery setup communication failed: %v", err)
		return "", err
	}

	// Log success and return result
	log.Printf("Recovery setup result: %v - %s", response.Success, response.Message)

	if !response.Success {
		return "", fmt.Errorf("registration failed: %s", response.Message)
	}

	// Return the actual seed phrase instead of just success status
	return seedPhrase, nil
}
