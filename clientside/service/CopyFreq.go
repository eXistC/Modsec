package service

import (
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type CopyFreqPayload struct {
	Item_Id uint `json:"item_id"`
}

type CopyFreqResponse struct {
	Item_Id uint   `json:"item_id"`
	Status  string `json:"status"`
}

// SendLoginToBackend sends login data to the backend server
func SendCopyFreqToBackend(payload *CopyFreqPayload, backendURL string) (*CopyFreqResponse, error) {
	// Convert payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode JSON: %v", err)
	}

	// Send data to backend server
	req, err := http.NewRequest("POST", backendURL, bytes.NewBuffer(jsonData)) // Change DELETE to POST
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
		return nil, fmt.Errorf("CopyFreq update failed with status: %d", resp.StatusCode) // Update error message
	}

	// Parse response
	var result CopyFreqResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func CopyFreqClient(item_id uint) (*CopyFreqResponse, error) {
	// Create a item payload
	payload := &CopyFreqPayload{
		Item_Id: item_id,
	}

	// Send to backend server
	backendURL := "http://localhost:8080/copyFreq" // Change as needed
	response, err := SendCopyFreqToBackend(payload, backendURL)
	if err != nil {
		log.Printf("CopyFreq communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("CopyFreq result: ItemID:%d, %s", response.Item_Id, response.Status)
	return response, nil
}
