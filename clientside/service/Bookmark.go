package service

import (
	"Modsec/clientside/client"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type BookmarkPayload struct {
	Item_Id  uint `json:"item_id"`
	Bookmark bool `json:"bookmark"`
}

type BookmarkResponse struct {
	Item_Id uint   `json:"item_id"`
	Status  string `json:"status"`
}

// SendLoginToBackend sends login data to the backend server
func SendBookmarkToBackend(payload *BookmarkPayload, backendURL string) (*BookmarkResponse, error) {
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
		return nil, fmt.Errorf("bookmark update failed with status: %d", resp.StatusCode) // Update error message
	}

	// Parse response
	var result BookmarkResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func BookmarkClient(item_id uint, bookmark bool) (*BookmarkResponse, error) {
	// Create a item payload
	payload := &BookmarkPayload{
		Item_Id:  item_id,
		Bookmark: bookmark,
	}

	// Send to backend server
	backendURL := "http://localhost:8080/bookmark" // Change as needed
	response, err := SendBookmarkToBackend(payload, backendURL)
	if err != nil {
		log.Printf("Bookmark communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("Bookmark result: ItemID:%d, %s", response.Item_Id, response.Status)
	return response, nil
}
