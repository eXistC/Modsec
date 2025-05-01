package service

import (
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type DeleteCategoryPayload struct {
	CategoryID uint `json:"category_id"`
}

type DeleteCategoryResponse struct {
	Category string `json:"Category"`
	Status   string `json:"status"`
}

// SendLoginToBackend sends login data to the backend server
func SendDeleteCategoryToBackend(payload *DeleteCategoryPayload, backendURL string) (*DeleteCategoryResponse, error) {
	// Convert payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode JSON: %v", err)
	}

	// Send data to backend server
	req, err := http.NewRequest("DELETE", backendURL, bytes.NewBuffer(jsonData))
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
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("DeleteCategory failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result DeleteCategoryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func DeleteCategoryClient(category_id uint) (*DeleteCategoryResponse, error) {
	// Create a item payload
	payload := &DeleteCategoryPayload{
		CategoryID: category_id,
	}

	// Send to backend server
	backendURL := "http://localhost:8080/deleteCategory" // Change as needed
	response, err := SendDeleteCategoryToBackend(payload, backendURL)
	if err != nil {
		log.Printf("DeleteCategory communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("DeleteCategory result: %s", response.Status)
	return response, nil
}
