package service

import (
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type DeleteItemPayload struct {
	ItemID uint `json:"item_id"`
}

type DeleteItemResponse struct {
	ItemID uint   `json:"item_id"`
	Status string `json:"status"`
}

// SendLoginToBackend sends login data to the backend server
func SendDeleteItemToBackend(payload *DeleteItemPayload, backendURL string) (*DeleteItemResponse, error) {
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
		return nil, fmt.Errorf("DeleteItem failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result DeleteItemResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func DeleteItemClient(item_id uint) (*DeleteItemResponse, error) {
	// Create a item payload
	payload := &DeleteItemPayload{
		ItemID: item_id,
	}

	// Send to backend server
	backendURL := "http://localhost:8080/deleteItem" // Change as needed
	response, err := SendDeleteItemToBackend(payload, backendURL)
	if err != nil {
		log.Printf("DeleteItem communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("DeleteItem result: ItemID:%d, %s", response.ItemID, response.Status)
	return response, nil
}
