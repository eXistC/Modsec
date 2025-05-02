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
	Data       string    `json:"Data"`
	IsBookmark bool      `json:"IsBookmark"`
}

type GetListItemResponse struct {
	Items []Item `json:"Items"`
}

func ProcessGetListItem(resp *GetListItemResponse) (*[]AfterItem, error) {
	var result []AfterItem

	for _, item := range resp.Items {
		// Add some debugging to check the raw title value
		log.Printf("Processing item with ID %d, title: %s, type: %s", item.ItemID, item.Title, item.TypeName)

		// Check if title is empty or contains raw non-base64 data
		if item.Title == "" || !isBase64(item.Title) {
			log.Printf("Item %d has non-base64 or empty title, using as-is", item.ItemID)

			// Use the title as-is or a placeholder if empty
			titleValue := item.Title
			if titleValue == "" {
				titleValue = fmt.Sprintf("[Item %d]", item.ItemID)
			}

			var dataMap map[string]interface{}

			// Try to process data if available
			if item.Data != "" && isBase64(item.Data) {
				dataBytes, err := utils.Ba64ToByt(item.Data)
				if err == nil {
					decryptedData, err := utils.DecryptAES256GCM(dataBytes, keymaster.Vaultkey)
					if err == nil {
						// Try to parse the JSON data
						if err := json.Unmarshal(decryptedData, &dataMap); err != nil {
							dataMap = make(map[string]interface{})
						}
					} else {
						dataMap = make(map[string]interface{})
					}
				} else {
					dataMap = make(map[string]interface{})
				}
			} else {
				dataMap = make(map[string]interface{})
			}

			eachitem := AfterItem{
				ItemID:     item.ItemID,
				Title:      titleValue,
				TypeName:   mapTypeNameToFrontend(item.TypeName), // Map the type name
				Data:       dataMap,
				DateCreate: item.DateCreate,
				DateModify: item.DateModify,
				IsBookmark: item.IsBookmark,
			}

			result = append(result, eachitem)
			continue
		}

		// Title is base64-encoded, try to decode it
		bytetitle, err := utils.Ba64ToByt(item.Title)
		if err != nil {
			log.Printf("Error decoding title for item ID %d: %v", item.ItemID, err)

			// Create entry with placeholder title
			eachitem := AfterItem{
				ItemID:     item.ItemID,
				Title:      fmt.Sprintf("[Item %d]", item.ItemID),
				TypeName:   mapTypeNameToFrontend(item.TypeName), // Map the type name
				Data:       make(map[string]interface{}),
				DateCreate: item.DateCreate,
				DateModify: item.DateModify,
				IsBookmark: item.IsBookmark,
			}
			result = append(result, eachitem)
			continue
		}

		// Try to decrypt the title
		decryptedTitle, err := utils.DecryptAES256GCM(bytetitle, keymaster.Vaultkey)
		if err != nil {
			log.Printf("Error decrypting title for item ID %d: %v", item.ItemID, err)

			// Create entry with placeholder title
			eachitem := AfterItem{
				ItemID:     item.ItemID,
				Title:      fmt.Sprintf("[Item %d]", item.ItemID),
				TypeName:   mapTypeNameToFrontend(item.TypeName), // Map the type name
				Data:       make(map[string]interface{}),
				DateCreate: item.DateCreate,
				DateModify: item.DateModify,
				IsBookmark: item.IsBookmark,
			}
			result = append(result, eachitem)
			continue
		}

		// Process the data field with similar error handling
		var dataMap map[string]interface{} = make(map[string]interface{})

		if item.Data != "" && isBase64(item.Data) {
			dataBytes, err := utils.Ba64ToByt(item.Data)
			if err == nil {
				decryptedData, err := utils.DecryptAES256GCM(dataBytes, keymaster.Vaultkey)
				if err == nil {
					// Try to parse the JSON data
					if err := json.Unmarshal(decryptedData, &dataMap); err != nil {
						log.Printf("Error unmarshaling JSON for item ID %d: %v", item.ItemID, err)
					}
				} else {
					log.Printf("Error decrypting data for item ID %d: %v", item.ItemID, err)
				}
			} else {
				log.Printf("Error decoding data for item ID %d: %v", item.ItemID, err)
			}
		}

		// Create the item with all processed data
		eachitem := AfterItem{
			ItemID:     item.ItemID,
			Title:      string(decryptedTitle),
			TypeName:   mapTypeNameToFrontend(item.TypeName), // Map the type name
			Data:       dataMap,
			DateCreate: item.DateCreate,
			DateModify: item.DateModify,
			IsBookmark: item.IsBookmark,
		}
		result = append(result, eachitem)
	}

	return &result, nil
}

// Helper function to check if a string is valid base64
func isBase64(s string) bool {
	// Quick check for characters that shouldn't be in base64
	for _, c := range s {
		if !((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
			(c >= '0' && c <= '9') || c == '+' || c == '/' || c == '=') {
			return false
		}
	}

	// Check if length is valid for base64 (multiple of 4 or padded correctly)
	if len(s)%4 != 0 {
		padding := 4 - (len(s) % 4)
		if padding > 2 {
			return false
		}
		// For properly padded base64, padding should be '='
		for i := 0; i < padding; i++ {
			if i >= len(s) || s[len(s)-1-i] != '=' {
				return false
			}
		}
	}

	// Try actual decoding
	_, err := utils.Ba64ToByt(s)
	return err == nil
}

// Add this function to map backend types to frontend types
func mapTypeNameToFrontend(backendType string) string {
	switch backendType {
	case "login":
		return "website"
	case "cryptowallet":
		return "crypto"
	case "identity":
		return "identity"
	case "note":
		return "memo"
	case "card":
		return "card"
	default:
		log.Printf("Unknown type name: %s, using as-is", backendType)
		return backendType
	}
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
