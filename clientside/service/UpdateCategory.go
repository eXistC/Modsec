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

type UpdateCategoryPayload struct {
	Category_id  uint   `json:"category_id"`
	CategoryName string `json:"categoryname"`
}

type UpdateCategoryResponse struct {
	CategoryID uint   `json:"category_id"`
	Status     string `json:"status"`
}

func ProcessUpdateCategory(category_id uint, categoryname string) (*UpdateCategoryPayload, error) {

	encryptedCategory, err := utils.EncryptAES256GCM([]byte(categoryname), keymaster.Vaultkey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt categoryname: %v", err)
	}

	StrencryptedCategory := utils.BytToBa64(encryptedCategory)

	payload := &UpdateCategoryPayload{
		Category_id:  category_id,
		CategoryName: StrencryptedCategory,
	}

	return payload, nil
}

// SendLoginToBackend sends login data to the backend server
func SendUpdateCategoryToBackend(payload *UpdateCategoryPayload, backendURL string) (*UpdateCategoryResponse, error) {
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
	fmt.Println("Category data:", req)

	resp, err := client.HMClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("UpdateCategory failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result UpdateCategoryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func UpdateCategoryClient(category_id uint, categoryname string) (*UpdateCategoryResponse, error) {
	//Update a category payload
	payload, err := ProcessUpdateCategory(category_id, categoryname)
	if err != nil {
		log.Printf("UpdateCategory processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/updateCategory" // Change as needed
	response, err := SendUpdateCategoryToBackend(payload, backendURL)
	if err != nil {
		log.Printf("UpdateCategory communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("UpdateCategory result: CategoryID:%d, %s", response.CategoryID, response.Status)
	return response, nil
}
