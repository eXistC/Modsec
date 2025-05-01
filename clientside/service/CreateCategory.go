package service

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

type CreateCategoryPayload struct {
	Category string `json:"category"`
}

type CreateCategoryResponse struct {
	Category string `json:"Category"`
	Status   string `json:"status"`
}

func ProcessCreateCategory(categoryname string) (*CreateCategoryPayload, error) {

	// Encrypt data with sq
	encryptedCategory, err := utils.EncryptAES256GCM([]byte(categoryname), keymaster.Vaultkey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Itemdata: %v", err)
	}

	StrencryptedCategory := utils.BytToBa64(encryptedCategory)

	// Create login payload
	payload := &CreateCategoryPayload{
		Category: StrencryptedCategory,
	}

	return payload, nil
}

// SendLoginToBackend sends login data to the backend server
func SendCreateCategoryToBackend(payload *CreateCategoryPayload, backendURL string) (*CreateCategoryResponse, error) {
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
	fmt.Println("Item data:", req)

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("CreateItem failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result CreateCategoryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func CreateCategoryClient(categoryname string) (*CreateCategoryResponse, error) {
	// Create a item payload
	payload, err := ProcessCreateCategory(categoryname)
	if err != nil {
		log.Printf("Login processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/createCategory" // Change as needed
	response, err := SendCreateCategoryToBackend(payload, backendURL)
	if err != nil {
		log.Printf("CreateItem communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("CreateCategory result: %s", response.Status)
	return response, nil
}
