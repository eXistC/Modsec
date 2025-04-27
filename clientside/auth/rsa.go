package auth

import (
	"Modsec/clientside/CipherAlgo/utils"
	"Modsec/clientside/client"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type PublicKeyResponse struct {
	PublicKey string `json:"PublicKey"`
}

func FetchPubKeyFromBackend(backendURL string) (string, error) {
	// Send GET request
	req, err := http.NewRequest("GET", backendURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create GET request: %v", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Access-Control-Allow-Credentials", "true")

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("backend returned error status: %d", resp.StatusCode)
	}

	// Parse response
	var response PublicKeyResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}
	return response.PublicKey, nil
}

func PubKeyRequest() (*rsa.PublicKey, error) {
	backendURL := "http://localhost:8080/publickey"

	publicKey, err := FetchPubKeyFromBackend(backendURL)
	if err != nil {
		log.Printf("Public key fetch failed: %v", err)
		return nil, err
	}
	DecodedPubKey, err := utils.ParsePublicKey(publicKey)
	if err != nil {
		log.Printf("Failed to parse public key: %v", err)
		return nil, err
	}

	return DecodedPubKey, nil
}
