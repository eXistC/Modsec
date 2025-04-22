package auth

import (
	"Modsec/clientside/CipherAlgo/Operation/DataStr"
	"Modsec/clientside/CipherAlgo/keymaster"
	"Modsec/clientside/CipherAlgo/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

// RegisterResponse represents the response from the backend
type RegisterResponse struct {
	Success    bool   `json:"success"`
	Message    string `json:"message"`
	SeedPhrase []byte `json:"seedphrase"`
	UserID     string `json:"user_id,omitempty"`
}

// ProcessRegistration handles the core registration logic
func ProcessRegistration(email, password string) (*DataStr.ResData, error) {
	log.Println("Processing registration for email:", email)

	// Generate master key from password
	// masterKey := utils.MasterPasswordGen(password, email)
	keymaster.Masterkey = utils.MasterPasswordGen(password, email)

	// Generate Sandwich hash for registration
	answer, iterations := utils.SandwichRegisOP(password, email)

	// Convert byte arrays to base64 strings
	baseAnswer := make([]string, 0, len(answer))
	for _, b := range answer {
		baseAnswer = append(baseAnswer, utils.BytToBa64(b))
	}

	// Convert iterations to strings
	iterationStrings := make([]string, len(iterations))
	for i, num := range iterations {
		iterationStrings[i] = strconv.Itoa(num)
	}

	// Join the arrays into strings with delimiters
	hp1HpR := strings.Join(baseAnswer, "|")
	iterationString := strings.Join(iterationStrings, "|")

	// Generate initialization vector
	iv, err := utils.GenerateIV()
	if err != nil {
		return nil, fmt.Errorf("failed to generate IV: %v", err)
	}
	keymaster.IVKey = iv

	// Generate session key
	// sessionKey, err := utils.GenerateSessionKey()
	keymaster.Sessionkey, err = utils.GenerateSessionKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate session key: %v", err)
	}

	// Generate vault key
	// vaultKey, err := utils.GenerateSessionKey()
	keymaster.Vaultkey, err = utils.GenerateSessionKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate vault key: %v", err)
	}

	// Encrypt Hp1-HpR with session key
	encryptedHp1HpR, err := utils.EncryptAES256GCM(hp1HpR, keymaster.Sessionkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Hp1-HpR: %v", err)
	}

	// Encrypt iterations with session key
	encryptedIteration, err := utils.EncryptAES256GCM(iterationString, keymaster.Sessionkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt iterations: %v", err)
	}

	// Encrypt vault key with master key
	protectedVaultKey, err := utils.EncryptAES256GCM(string(keymaster.Vaultkey), keymaster.Masterkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt vault key: %v", err)
	}

	// Create response data structure using DataStr.ResData
	resData := &DataStr.ResData{
		Email:              email,
		EncryptedHp1_HpR:   encryptedHp1HpR,
		EncryptedIteration: encryptedIteration,
		ProtectedVaultKey:  protectedVaultKey,
		IV:                 keymaster.IVKey,
		Sessionkey:         keymaster.Sessionkey,
	}

	return resData, nil
}

// SendRegistrationToBackend sends registration data to the backend server
func SendRegistrationToBackend(payload *DataStr.ResData, backendURL string) (*RegisterResponse, error) {
	// Use the payload parameter directly
	jsonPayload := DataStr.ResData{
		EncryptedHp1_HpR:   payload.EncryptedHp1_HpR,
		EncryptedIteration: payload.EncryptedIteration,
		ProtectedVaultKey:  payload.ProtectedVaultKey,
		Email:              payload.Email,
		IV:                 payload.IV, // I'm not sure to change this to keymaster.IVKey
		Sessionkey:         payload.Sessionkey,
	}

	// Convert payload to JSON
	jsonData, err := json.Marshal(jsonPayload)
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
		return nil, fmt.Errorf("failed to send registration data to backend: %v", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("backend registration failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result RegisterResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// RegisterUser combines processing and backend communication
func RegisterUser(email, password string) (string, error) {
	// Create a registration payload
	payload, err := ProcessRegistration(email, password)
	if err != nil {
		log.Printf("Registration processing failed: %v", err)
		return "", err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/register" // Change as needed
	response, err := SendRegistrationToBackend(payload, backendURL)
	if err != nil {
		log.Printf("Registration communication failed: %v", err)
		return "", err
	}

	// Log success and return result
	log.Printf("Registration result: %v - %s", response.Success, response.Message)

	if !response.Success {
		return "", fmt.Errorf("registration failed: %s", response.Message)
	}

	seedPhrase := utils.RandomSeedPhrase()
	log.Printf("Decrypted Seed Phrase: %s", seedPhrase)
	// SeedPhrase set up heres

	// Return the actual seed phrase instead of just success status
	return seedPhrase, nil
}
