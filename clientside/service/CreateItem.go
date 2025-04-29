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
	"time"
)

type CreateItemPayload struct {
	Title string `json:"title"`
	Type  string `json:"type"`
	Data  []byte `json:"data"`
}

type CreateItemResponse struct {
	ItemID   string    `json:"item_id"`
	Title    string    `json:"title"`
	CreateAt time.Time `json:"createAt"`
	Message  string    `json:"message"`
}

func ProcessCreateItem(title, typename string, itemdata map[string]interface{}) (*CreateItemPayload, error) {

	//Encode JSON to byte
	itemdatabyte, err := json.Marshal(itemdata)
	if err != nil {
		return nil, fmt.Errorf("failed to encode JSON: %v", err)
	}

	// Encrypt data with sq
	encryptedItemdata, err := utils.EncryptAES256GCM(itemdatabyte, keymaster.Vaultkey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt iterations: %v", err)
	}

	// Create login payload
	payload := &CreateItemPayload{
		Title: title,
		Type:  typename,
		Data:  encryptedItemdata,
	}

	return payload, nil
}

// SendLoginToBackend sends login data to the backend server
func SendCreateItemToBackend(payload *CreateItemPayload, backendURL string) (*CreateItemResponse, error) {
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
	fmt.Printf("Item data:", req)

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
	var result CreateItemResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// LoginUser combines processing and backend communication
func CreateItemClient(title, typename string, ItemData map[string]interface{}) (*CreateItemResponse, error) {
	// Create a item payload
	payload, err := ProcessCreateItem(title, typename, ItemData)
	if err != nil {
		log.Printf("Login processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/createItem" // Change as needed
	response, err := SendCreateItemToBackend(payload, backendURL)
	if err != nil {
		log.Printf("CreateItem communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("CreateItem result: ItemID:%v, %s", response.ItemID, response.Message)
	return response, nil
}
