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

type UpdateItemPayload struct {
	Item_id     uint   `json:"item_id"`
	Title       string `json:"title"`
	Category_id *uint  `json:"category_id"`
	Data        []byte `json:"data"`
}

type UpdateItemResponse struct {
	ItemID  uint   `json:"item_id"`
	Message string `json:"message"`
}

func ProcessUpdateItem(Item_id uint, category_id *uint, title string, itemdata map[string]interface{}) (*UpdateItemPayload, error) {

	//Encode JSON to byte
	itemdatabyte, err := json.Marshal(itemdata)
	if err != nil {
		return nil, fmt.Errorf("failed to encode JSON: %v", err)
	}

	// Encrypt data with sq
	encryptedItemdata, err := utils.EncryptAES256GCM(itemdatabyte, keymaster.Vaultkey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Itemdata: %v", err)
	}

	encryptedTitle, err := utils.EncryptAES256GCM([]byte(title), keymaster.Vaultkey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt Title: %v", err)
	}

	StrencryptedTitle := utils.BytToBa64(encryptedTitle)

	// Update login payload
	payload := &UpdateItemPayload{
		Item_id:     Item_id,
		Category_id: category_id,
		Title:       StrencryptedTitle,
		Data:        encryptedItemdata,
	}

	return payload, nil
}

// SendLoginToBackend sends login data to the backend server
func SendUpdateItemToBackend(payload *UpdateItemPayload, backendURL string) (*UpdateItemResponse, error) {
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
		return nil, fmt.Errorf("UpdateItem failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result UpdateItemResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

func UpdateItemClient(item_id uint, category_id *uint, title string, ItemData map[string]interface{}) (*UpdateItemResponse, error) {
	//Update a item payload
	payload, err := ProcessUpdateItem(item_id, category_id, title, ItemData)
	if err != nil {
		log.Printf("UpdateItem processing failed: %v", err)
		return nil, err
	}

	// Send to backend server
	backendURL := "http://localhost:8080/updateItem" // Change as needed
	response, err := SendUpdateItemToBackend(payload, backendURL)
	if err != nil {
		log.Printf("UpdateItem communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("UpdateItem result: ItemID:%d, %s", response.ItemID, response.Message)
	return response, nil
}
