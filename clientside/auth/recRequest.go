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

type RecRequestPayload struct {
	Email      string `json:"encrypted_email"`
	Sessionkey []byte `json:"encrypted_sessionkey"` // This one is encrypted with public key
	IV         []byte `json:"iv"`
}

type RecRequestResponse struct {
	Success             bool   `json:"success"`
	EncryptedReVaultkey string `json:"encrypted_revaultkey,omitempty"`
	ReIV                []byte `json:"reiv"`
}

// ProcessRegistration handles the core registration logic
func ProcessRecoveryRequest(email string) (*RecRequestPayload, error) {
	log.Println("Processing registration for email:", email)

	// Generate initialization vector
	iv, err := utils.GenerateIV()
	if err != nil {
		return nil, fmt.Errorf("failed to generate IV: %v", err)
	}
	keymaster.IVKey = iv
	fmt.Printf("Generating new IV")

	// Generate session key
	keymaster.Sessionkey, err = utils.GenerateSessionKey()
	fmt.Printf("Generating new Session key")
	if err != nil {
		return nil, fmt.Errorf("failed to generate session key: %v", err)
	}

	//Get the Public key
	publickey, err := PubKeyRequest()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Publickey: %v", err)
	}
	encryptedSession, err := utils.EncryptWithPublicKey(publickey, keymaster.Sessionkey)
	if err != nil {
		return nil, fmt.Errorf("failed to Encrypt Session key: %v", err)
	}

	HashEmail := utils.BytToBa64(utils.EmailToSHA256(email))
	encryptedEmail, err := utils.EncryptAES256GCM(HashEmail, keymaster.Sessionkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Hp1-HpR: %v", err)
	}

	// Create response data structure using DataStr.ResData
	resData := &RecRequestPayload{
		Email:      encryptedEmail,
		Sessionkey: encryptedSession,
		IV:         keymaster.IVKey,
	}

	return resData, nil
}

// SendRegistrationToBackend sends registration data to the backend server
func SendRecoveryRequestBackend(payload *RecRequestPayload, backendURL string) (*RecRequestResponse, error) {
	// Use the payload parameter directly
	jsonPayload := RecRequestPayload{
		Email:      payload.Email,
		Sessionkey: payload.Sessionkey,
		IV:         payload.IV,
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
	var result RecRequestResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// RegisterUser combines processing and backend communication
func RecoveryRequest(email string) (*RecRequestResponse, error) {
	// Create a registration payload
	payload, err := ProcessRecoveryRequest(email)
	if err != nil {
		log.Printf("Registration processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/recovery/request" // Change as needed
	response, err := SendRecoveryRequestBackend(payload, backendURL)
	if err != nil {
		log.Printf("Recovery communication failed: %v", err)
		return nil, err
	}

	log.Printf("Recovery request successful: %+v", response)

	// Called Recovery Process

	return response, nil
}
