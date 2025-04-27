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
	"net/url"
	"strconv"
	"strings"
)

// RegisterResponse represents the response from the backend
type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	UserID  string `json:"user_id,omitempty"`
}

type RegisterPayload struct {
	EncryptedHp1_HpR   string `json:"encrypted_hp1_hpr"`
	EncryptedIteration string `json:"encrypted_iteration"`
	ProtectedVaultKey  string `json:"protected_vault_key"`
	Email              string `json:"email"`
	IV                 []byte `json:"iv"`
	Sessionkey         []byte `json:"sessionkey"`
}

// ProcessRegistration handles the core registration logic
func ProcessRegistration(email, password string) (*RegisterPayload, error) {
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
	resData := &RegisterPayload{
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
func SendRegistrationToBackend(payload *RegisterPayload, backendURL string) (*RegisterResponse, error) {
	// Use the payload parameter directly
	jsonPayload := RegisterPayload{
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
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Access-Control-Allow-Credentials", "true")

	// token := "your-jwt-token-here" // replace with actual token
	// req.AddCookie(&http.Cookie{
	// 	Name:  "auth_token",
	// 	Value: token,
	// })

	// Added this part in theory it will share cookie
	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	///////////////////////////////// Server side /////////////////////////////////
	u, err := url.Parse(backendURL)
	if err != nil {
		fmt.Println("Invalid URL:", err)
		return nil, err
	}

	cookies := client.HMClient.Jar.Cookies(u)
	fmt.Println("Cookies for", backendURL)
	for _, c := range cookies {
		fmt.Printf(" Here %s = %s (Path=%s, HttpOnly=%t)\n", c.Name, c.Value, c.Path, c.HttpOnly)
	}
	///////////////////////////////// Server side /////////////////////////////////

	///////////////////////////////// Client side /////////////////////////////////
	// 	Vite Server URL: http://localhost:5173/
	//   ➜  Local:   http://localhost:5173/
	// Running frontend DevWatcher command: 'npm run dev'
	// Building application for development...
	//   ➜  Network: use --host to expose
	//   • Generating bindings: Done.
	//   • Compiling application: Done.
	//   • Packaging application: Done.

	// Using DevServer URL: http://localhost:34115
	// Using Frontend DevServer URL: http://localhost:5173/
	// Using reload debounce setting of 100 milliseconds
	sigma, err := url.Parse("http://localhost:5173") //Or maybe http://localhost:34115
	if err != nil {
		fmt.Println("Invalid URL:", err)
		return nil, err
	}

	cookies2 := client.HMClient.Jar.Cookies(sigma)
	fmt.Println("Cookies for", sigma)
	for _, c := range cookies2 {
		fmt.Printf(" Here %s = %s (Path=%s, HttpOnly=%t)\n", c.Name, c.Value, c.Path, c.HttpOnly)
	}
	//////////////////////////////// Client side /////////////////////////////////

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

	seedPhrase, err := RecoverySetup(email) // may remove Email in the future
	if err != nil {
		log.Printf("Recovery Setup failed: %v", err)
		return "", err
	}
	log.Printf("Seed Phrase: %s", seedPhrase)

	// Return the actual seed phrase instead of just success status
	return seedPhrase, nil
}
