package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strings"

	"Modsec/clientside/auth"
	"Modsec/clientside/service"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/crypto/pbkdf2"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	log.Println("ModSec application starting...")
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) SimplePOC(title string) {
	runtime.WindowSetTitle(a.ctx, title)
}

func (a *App) EmailToSHA256(email string) string {
	// This function turn email SInto sha256
	// which will be used as salt in the future. or maybe store in database
	// Input as string
	// Output as string

	// Trimming spaces and converting to lowercase
	// This maybe removed in the future if raise concern!
	normalizedEmail := strings.TrimSpace(strings.ToLower(email))

	// Hash the email using SHA-256
	emailHash := sha256.Sum256([]byte(normalizedEmail))

	// Convert the hash to a hexadecimal string
	// If you need to use it as salt you may convert into byte
	return hex.EncodeToString(emailHash[:])
}

func (a *App) PBKDF2Function(password, salt string, iterations, keyLength int) string {
	// This function is for PBKDF2
	// It use SHA256 to do the hashing and the number of iteration can be control
	// Input: Password(Str) Salt(Str) Iteration(int) Keylength(int) <== Depend on algorithm we use
	// Output as string

	// Convert password and salt to byte slices
	passwordBytes := []byte(password)
	saltBytes := []byte(salt)

	// Doing funky hashing by using sha256(For now)
	key := pbkdf2.Key(passwordBytes, saltBytes, iterations, keyLength, sha256.New)

	// Return the key as a hexadecimal string
	return hex.EncodeToString(key)
}

func GenerateRandomBytes(size int) ([]byte, error) {
	// Create a byte slice to hold the random bytes
	// This function will be used with generateIV and generateSessionkey
	// Input: size(int)
	// Output: byte and error
	randomBytes := make([]byte, size)

	// Fill in the randombyte with secure random byte
	_, err := rand.Read(randomBytes) //secure Crypto lib btw
	if err != nil {
		return nil, fmt.Errorf("failed to generate random bytes: %w", err)
	}

	return randomBytes, nil
}

func (a *App) GenerateIV() ([]byte, error) {
	// Request: GenerateRandomBytes function
	//
	return GenerateRandomBytes(12) // Returns raw 12 byte (96)
}

func (a *App) GenerateSessionKey() ([]byte, error) {
	// Request: GenerateRandomBytes function
	//
	return GenerateRandomBytes(32) // Returns raw 32 byte (256)
}

func (a *App) EncryptAES256GCM(plaintext []byte, key []byte, IV []byte) ([]byte, error) {
	// AES256 using GCM mode
	// Input: plaintext(byte) Key 32(byte) IV 12(byte)
	// Output: byte, Error
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM mode: %w", err)
	}

	// Encrypt the plaintext using the provided IV
	ciphertext := gcm.Seal(nil, IV, plaintext, nil)

	// Return only the ciphertext (nonce should be stored separately)
	return ciphertext, nil
}

// decryptAES256GCM decrypts ciphertext using AES-256 GCM with a provided nonce.
func (a *App) DecryptAES256GCM(ciphertext []byte, key []byte, IV []byte) ([]byte, error) {
	// AES256 using GCM mode
	// Input: ciphertext(byte) Key 32(byte) IV 12(byte)
	// Output: byte, Error
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM mode: %w", err)
	}

	// Decrypt the ciphertext using the provided nonce
	plaintext, err := aesGCM.Open(nil, IV, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt ciphertext: %w", err)
	}

	return plaintext, nil
}

// RegisterUser handles the user registration process
func (a *App) RegisterUser(email string, password string) (string, error) {
	// Validate input
	if !auth.ValidateEmailFormat(email) {
		return "", fmt.Errorf("invalid email format")
	}

	valid, msg := auth.ValidatePasswordStrength(password)
	if !valid {
		return "", fmt.Errorf(msg)
	}

	// Call the modularized registration function that now returns seedPhrase
	return auth.RegisterUser(email, password)
}

// LoginUser is a wails-exported function to handle login
func (a *App) LoginUser(email, password string) map[string]interface{} {
	// Add more detailed logging at entry point
	log.Printf("LoginUser called for email: %s", email)

	// Call the auth.LoginUser function
	response, err := auth.LoginUser(email, password)

	result := map[string]interface{}{
		"success": false,
		"message": "",
	}

	if err != nil {
		errMsg := err.Error()
		log.Printf("LoginUser error: %v", errMsg)

		// Check for "login communication failed" first since it may contain other error messages
		if strings.Contains(errMsg, "login communication failed") {
			// Look for "Password not match" within the communication failed message
			if strings.Contains(errMsg, "Password not match") {
				result["message"] = "Incorrect password"
				return result
			}

			// Check for this specific error message from your backend
			if strings.Contains(errMsg, "An error occurred during login") {
				// When this error happens during login attempt with valid email,
				// it's typically a password issue
				result["message"] = "Incorrect password"
				return result
			}

			// Extract more specific error message if available
			parts := strings.Split(errMsg, "login communication failed: ")
			if len(parts) > 1 && parts[1] != "" {
				// Look for common error patterns within the extracted message
				extractedMsg := parts[1]
				if strings.Contains(extractedMsg, "Password not match") ||
					strings.Contains(extractedMsg, "invalid password") {
					result["message"] = "Incorrect password"
				} else if strings.Contains(extractedMsg, "invalid email") ||
					strings.Contains(extractedMsg, "email not found") {
					result["message"] = "Email not found"
				} else {
					// Use the extracted message directly if it doesn't match known patterns
					result["message"] = extractedMsg
				}
				return result
			} else {
				result["message"] = "Connection error"
				return result
			}
		}

		// Check for other specific error patterns
		if strings.Contains(errMsg, "Password not match") {
			result["message"] = "Incorrect password"
		} else if strings.Contains(errMsg, "failed to decrypt vault key") {
			result["message"] = "Incorrect password"
		} else if strings.Contains(errMsg, "invalid password") {
			result["message"] = "Incorrect password"
		} else if strings.Contains(errMsg, "An error occurred during login") {
			// Added this specific check for your error message
			result["message"] = "Incorrect password"
		} else if strings.Contains(errMsg, "invalid email") ||
			strings.Contains(errMsg, "failed to find user") {
			result["message"] = "Email not found"
		} else if strings.Contains(errMsg, "login failed with status: 401") {
			result["message"] = "Invalid email or password"
		} else if strings.Contains(errMsg, "login failed with status: 500") {
			// Status 500 often means password errors in your backend
			result["message"] = "Incorrect password"
		} else {
			// Log the actual error for debugging but return a user-friendly message
			log.Printf("Unrecognized login error: %v", errMsg)
			result["message"] = "Server error. Please try again later"
		}

		return result
	}

	// If no error but the response indicates failure
	if response != nil && !response.Success {
		// Handle backend response failure cases
		log.Printf("Backend returned success=false with message: %s", response.Message)

		// Check for known error patterns in the response message
		if strings.Contains(strings.ToLower(response.Message), "password") {
			result["message"] = "Incorrect password"
		} else {
			result["message"] = response.Message
		}
		return result
	}

	// Success case
	log.Println("Login successful")
	result["success"] = true
	result["message"] = "Login successful"

	return result
}

// CheckSession verifies if the user has a valid session
func (a *App) CheckSession() map[string]interface{} {
	response, err := auth.SessionCheckUser()
	if err != nil {
		return map[string]interface{}{
			"Success": false,
			"Message": "Session invalid",
		}
	}

	return map[string]interface{}{
		"Success": response.Success,
		"Message": response.Message,
		"Email":   response.Email,
	}
}

// Add this function to your App struct to expose the LogoutUser functionality
func (a *App) LogoutUser() map[string]interface{} {
	response, err := auth.LogoutUser()
	if err != nil {
		return map[string]interface{}{
			"Success": false,
			"Message": err.Error(),
		}
	}

	return map[string]interface{}{
		"Success": response.Success,
		"Message": response.Message,
	}
}

// Add this function to expose RecoveryProcess to the frontend
func (a *App) RecoveryProcess(email, password, seedPhrase string) (string, error) {
	// Call the auth package's RecoveryProcess function
	return auth.RecoveryProcess(email, password, seedPhrase)
}

// Add this function to expose RecoverySetup to the frontend if needed
func (a *App) RecoverySetup(email string) (string, error) {
	return auth.RecoverySetup(email)
}

// CreateItemClient exposes the client-side service function to the frontend
func (a *App) CreateItemClient(title, typename string, ItemData map[string]interface{}) (*service.CreateItemResponse, error) {
	log.Printf("CreateItemClient called with title: %s, type: %s", title, typename)
	return service.CreateItemClient(title, typename, ItemData)
}
func (a *App) ToggleBookmark(itemId uint, bookmark bool) (*service.BookmarkResponse, error) {
	return service.BookmarkClient(itemId, bookmark)
}

// Function to get the list of categories with their counts
func (a *App) GetCategoryList() ([]map[string]interface{}, error) {
	// Get actual category data from the service
	items, categories, err := service.GetListItemClient()
	if err != nil {
		log.Printf("Error getting category list: %v", err)
		return nil, err
	}

	// If no categories were found, return an empty array
	if categories == nil {
		return []map[string]interface{}{}, nil
	}

	// Create a map to store item counts for each category
	categoryCounts := make(map[uint]int)

	// Count items per category
	if items != nil {
		for _, item := range *items {
			// Check the item's Data map for CategoryID
			if categoryID, ok := item.Data["CategoryID"]; ok {
				if floatID, isFloat := categoryID.(float64); isFloat {
					// Convert float64 to uint
					categoryCounts[uint(floatID)]++
				} else if intID, isInt := categoryID.(int); isInt {
					// Handle int type
					categoryCounts[uint(intID)]++
				} else if uintID, isUint := categoryID.(uint); isUint {
					// Handle uint type directly
					categoryCounts[uintID]++
				}
			}
		}
	}

	// Build the response in the format expected by the frontend
	result := make([]map[string]interface{}, 0, len(*categories))
	for _, cat := range *categories {
		result = append(result, map[string]interface{}{
			"CategoryID":   cat.CategoryID,
			"CategoryName": cat.CategoryName,
			"ItemCount":    categoryCounts[cat.CategoryID], // Get count from our map
		})
	}

	return result, nil
}

// Function to create a new category
func (a *App) CreateCategoryClient(categoryName string) (*service.CreateCategoryResponse, error) {
	return service.CreateCategoryClient(categoryName)
}

// Function to delete a category
func (a *App) DeleteCategoryClient(categoryId uint) (*service.DeleteCategoryResponse, error) {
	return service.DeleteCategoryClient(categoryId)
}

// Function to update an existing category
func (a *App) UpdateItemClient(itemId uint, categoryId *uint, title string, ItemData map[string]interface{}) (*service.UpdateItemResponse, error) {
	return service.UpdateItemClient(itemId, categoryId, title, ItemData)
}

// GetPasswordList returns password items with their complete information including categories
func (a *App) GetPasswordList() ([]map[string]interface{}, error) {
	log.Println("GetPasswordList called from frontend")

	// Get both items and categories from the client service
	items, categories, err := service.GetListItemClient()
	if err != nil {
		log.Printf("GetPasswordList error: %v", err)
		return nil, err
	}

	// Make sure we don't return nil
	if items == nil {
		log.Println("GetPasswordList: items is nil, returning empty array")
		return []map[string]interface{}{}, nil
	}

	// Create a map of category ID to name for easy lookup
	categoryMap := make(map[uint]string)
	if categories != nil {
		for _, cat := range *categories {
			categoryMap[cat.CategoryID] = cat.CategoryName
		}
	}

	// Build response with items including their category names
	result := make([]map[string]interface{}, 0, len(*items))
	for _, item := range *items {
		// Create a map with all item fields
		itemMap := map[string]interface{}{
			"ItemID":     item.ItemID,
			"Title":      item.Title,
			"TypeName":   item.TypeName,
			"DateCreate": item.DateCreate,
			"DateModify": item.DateModify,
			"Data":       item.Data,
			"IsBookmark": item.IsBookmark,
		}

		// Add category information if available
		if item.CategoryID != nil {
			itemMap["CategoryID"] = *item.CategoryID
			if catName, ok := categoryMap[*item.CategoryID]; ok {
				itemMap["CategoryName"] = catName
			} else {
				itemMap["CategoryName"] = ""
			}
		} else {
			itemMap["CategoryID"] = nil
			itemMap["CategoryName"] = ""
		}

		result = append(result, itemMap)
	}

	log.Printf("GetPasswordList returning %d items", len(result))
	return result, nil
}

// DeleteItemClient exposes the delete item functionality to the frontend
func (a *App) DeleteItemClient(itemId uint) (*service.DeleteItemResponse, error) {
	log.Printf("DeleteItemClient called with itemId: %d", itemId)

	response, err := service.DeleteItemClient(itemId)
	if err != nil {
		log.Printf("Error deleting item %d: %v", itemId, err)
		return nil, err
	}

	log.Printf("Successfully deleted item %d, response: %+v", itemId, response)
	return response, nil
}

// UpdateCategoryClient exposes the category update functionality to the frontend
func (a *App) UpdateCategoryClient(categoryId uint, categoryName string) (*service.UpdateCategoryResponse, error) {
	log.Printf("UpdateCategoryClient called with categoryId: %d, name: %s", categoryId, categoryName)

	response, err := service.UpdateCategoryClient(categoryId, categoryName)
	if err != nil {
		log.Printf("Error updating category %d: %v", categoryId, err)
		return nil, err
	}

	log.Printf("Successfully updated category %d, response: %+v", categoryId, response)
	return response, nil
}
