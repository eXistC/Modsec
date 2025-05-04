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

// LoginUser handles the user login process
func (a *App) LoginUser(email string, password string) (map[string]interface{}, error) {
	// Validate input
	if !auth.ValidateEmailFormat(email) {
		return nil, fmt.Errorf("invalid email format")
	}

	// Call the modularized login function
	response, err := auth.LoginUser(email, password)
	if err != nil {
		return nil, err
	}

	// Convert to a map for frontend consumption
	result := map[string]interface{}{
		"success":        response.Success,
		"message":        response.Message,
		"sessionToken":   response.SessionToken,
		"encryptedVault": response.EncryptedVault,
	}

	return result, nil
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

// Add this function to your App struct methods

func (a *App) GetPasswordList() (*[]service.AfterItem, error) {
	return service.GetListItemClient()
}

// Add this function to your App struct methods

func (a *App) ToggleBookmark(itemId uint, bookmark bool) (*service.BookmarkResponse, error) {
	return service.BookmarkClient(itemId, bookmark)
}

// Add these functions to your App struct methods

// Function to get the list of categories with their counts - placeholder implementation
func (a *App) GetCategoryList() ([]map[string]interface{}, error) {
	// Placeholder data for testing
	categories := []map[string]interface{}{
		{
			"CategoryID":   uint(1),
			"CategoryName": "Personal",
			"ItemCount":    5,
		},
		{
			"CategoryID":   uint(2),
			"CategoryName": "Work",
			"ItemCount":    3,
		},
		{
			"CategoryID":   uint(3),
			"CategoryName": "Finance",
			"ItemCount":    2,
		},
		{
			"CategoryID":   uint(4),
			"CategoryName": "Uncategorized",
			"ItemCount":    1,
		},
	}

	return categories, nil
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
func (a *App) UpdateItemClient(itemId uint, title string, ItemData map[string]interface{}) (*service.UpdateItemResponse, error) {
	return service.UpdateItemClient(itemId, title, ItemData)
}

// Add this function to your App struct methods in app.go
func (a *App) DeleteItemClient(itemId uint) (*service.DeleteItemResponse, error) {
	return service.DeleteItemClient(itemId)
}
