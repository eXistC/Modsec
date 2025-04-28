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

type RecProcessPayload struct {
	EncryptedEmail     string `json:"encrypted_email"`      // session key
	EncryptedHp1_HpR   string `json:"encrypted_hp1_hpr"`    // session key
	EncryptedIteration string `json:"encrypted_iteration"`  // session key
	ProtectedVaultKey  string `json:"protected_vault_key"`  // New Master key
	Sessionkey         []byte `json:"encrypted_sessionkey"` // public key
	IV                 []byte `json:"iv"`
}

type RecProcessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	ReIV    []byte `json:"reiv"`
}

// ProcessRegistration handles the core registration logic
func ProcessRecoveryProcess(email, password string, vaultKey []byte) (*RecProcessPayload, error) {
	log.Println("Processing registration for email:", email)

	//Get the Public key
	publickey, err := PubKeyRequest()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Publickey: %v", err)
	}

	keymaster.Vaultkey = vaultKey

	// Generate master key from password
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

	encryptedEmail, err := utils.EncryptAES256GCM(email, keymaster.Sessionkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Hp1-HpR: %v", err)
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
	protectedVaultKey, err := utils.EncryptAES256GCM(string(vaultKey), keymaster.Masterkey, keymaster.IVKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt vault key: %v", err)
	}

	encryptedSession, err := utils.EncryptWithPublicKey(publickey, keymaster.Sessionkey)
	if err != nil {
		return nil, fmt.Errorf("failed to Encrypt Session key: %v", err)
	}

	// Create response data structure using DataStr.ResData
	resData := &RecProcessPayload{
		EncryptedEmail:     encryptedEmail,
		EncryptedHp1_HpR:   encryptedHp1HpR,
		EncryptedIteration: encryptedIteration,
		ProtectedVaultKey:  protectedVaultKey,
		Sessionkey:         encryptedSession,
		IV:                 keymaster.IVKey,
	}

	return resData, nil
}

// SendRegistrationToBackend sends registration data to the backend server
func SendRecoveryProcessBackend(payload *RecProcessPayload, backendURL string) (*RecProcessResponse, error) {
	// Use the payload parameter directly
	jsonPayload := RecProcessPayload{
		EncryptedEmail:     payload.EncryptedEmail,
		EncryptedHp1_HpR:   payload.EncryptedHp1_HpR,
		EncryptedIteration: payload.EncryptedIteration,
		ProtectedVaultKey:  payload.ProtectedVaultKey,
		Sessionkey:         payload.Sessionkey,
		IV:                 payload.IV,
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
	sigma, err := url.Parse("http://localhost:5173")
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
	var result RecProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// RecoveryProcess combines processing and backend communication
func RecoveryProcess(email, password, SeedPhrase string) (string, error) {
	// Create a Recovery request payload
	result, err := RecoveryRequest(email) // <=== Called Recovery Request here
	if err != nil {
		log.Printf("Recovery processing failed: %v", err)
		return "nil", err
	}

	//Process 12 seed phrase
	SeedToKey := utils.SHA256Function([]byte(SeedPhrase))

	//Recovery Vault key process and authentication process
	EnReVaultkey, err := utils.Ba64ToByt(result.EncryptedReVaultkey)
	if err != nil {
		log.Printf("Unable convert ReVault key: %v", err)
		return "nil", err
	}
	ConcatKey, err := utils.DecryptAES256GCM(EnReVaultkey, SeedToKey, result.ReIV)
	if err != nil {
		log.Printf("Unable to decrypt ReVault key: %v", err)
		return "nil", err
	}

	vaultKey, SeedInside, err := utils.DeconcatKeyAndSeed(utils.BytToBa64(ConcatKey))

	// Authentication for seed key
	if SeedInside != SeedPhrase {
		log.Printf("Seed isn't a match: %v", err)
		return "", err
	}

	payload, err := ProcessRecoveryProcess(email, password, vaultKey)
	if err != nil {
		log.Printf("Recovery processing failed: %v", err)
		return "", err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/recovery/process" // Change as needed
	response, err := SendRecoveryProcessBackend(payload, backendURL)
	if err != nil {
		log.Printf("Recovery communication failed: %v", err)
		return "nil", err
	}

	log.Printf("Recovery request successful: %+v", response.Success)

	if !response.Success {
		return "", fmt.Errorf("registration failed: %s", response.Message)
	}

	seedPhrase, err := RecoverySetup(email)

	if err != nil {
		log.Printf("Recovery Setup failed: %v", err)
		return "", err
	}

	log.Printf("Seed Phrase: %s", seedPhrase)

	return seedPhrase, nil
}
