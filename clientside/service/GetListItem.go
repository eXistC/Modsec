package service

import (
	"Modsec/clientside/CipherAlgo/keymaster"
	"Modsec/clientside/CipherAlgo/utils"
	"Modsec/clientside/client"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type AfterItem struct {
	ItemID     uint                   `json:"ItemID"`
	Title      string                 `json:"Title"`
	TypeName   string                 `json:"TypeName"`
	DateCreate time.Time              `json:"DateCreate"`
	DateModify time.Time              `json:"DateModify"`
	Data       map[string]interface{} `json:"Data"`
	IsBookmark bool                   `json:"IsBookmark"`
}

type Item struct {
	ItemID     uint      `json:"ItemID"`
	Title      string    `json:"Title"`
	TypeName   string    `json:"TypeName"`
	DateCreate time.Time `json:"DateCreate"`
	DateModify time.Time `json:"DateModify"`
	Data       string    `json:"Data"` // base64 encoded string
	IsBookmark bool      `json:"IsBookmark"`
}

type GetListItemResponse struct {
	Items []Item `json:"Items"`
}

func ProcessGetListItem(resp *GetListItemResponse) (*[]AfterItem, error) {

	var result []AfterItem

	for _, item := range resp.Items {
		Databyte, err := utils.Ba64ToByt(item.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to convert Itemdata: %v", err)
		}

		decryptedItemdata, err := utils.DecryptAES256GCM(Databyte, keymaster.Vaultkey)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt Itemdata: %v", err)
		}

		bytetitle, err := utils.Ba64ToByt(item.Title)
		if err != nil {
			return nil, fmt.Errorf("failed to convert bytetitle: %v", err)
		}

		decryptedTitle, err := utils.DecryptAES256GCM(bytetitle, keymaster.Vaultkey)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt Title: %v", err)
		}

		var DataItem map[string]interface{}
		if err := json.Unmarshal(Databyte, &decryptedItemdata); err != nil {
			return nil, err
		}
		eachitem := AfterItem{
			ItemID:     item.ItemID,
			Title:      string(decryptedTitle),
			TypeName:   item.TypeName,
			Data:       DataItem,
			DateCreate: item.DateCreate,
			DateModify: item.DateModify,
			IsBookmark: item.IsBookmark,
		}
		result = append(result, eachitem)
	}

	return &result, nil
}

// SendLoginToBackend sends login data to the backend server
func SendGetListItemToBackend(backendURL string) (*GetListItemResponse, error) {

	// Send data to backend server
	req, err := http.NewRequest("GET", backendURL, nil)
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
		return nil, fmt.Errorf("GetListItem failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var result GetListItemResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &result, nil
}

// LoginUser combines processing and backend communication
func GetListItemClient() (*[]AfterItem, error) {

	// Send to backend server
	backendURL := "http://localhost:8080/getItemList"
	response, err := SendGetListItemToBackend(backendURL)
	if err != nil {
		log.Printf("GetListItem communication failed: %v", err)
		return nil, err
	}

	resptofront, err := ProcessGetListItem(response)
	if err != nil {
		log.Printf("GetListItem communication failed: %v", err)
		return nil, err
	}

	// Log success and return result
	log.Printf("GetListItem result: All good")
	return resptofront, nil
}
