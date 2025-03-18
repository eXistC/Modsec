package main

import (
	"Modsec/clientside/CipherAlgo/Operation/DataStr"
	myConvert "Modsec/clientside/CipherAlgo/utils"
	myEncrypt "Modsec/clientside/CipherAlgo/utils"
	myGenVal "Modsec/clientside/CipherAlgo/utils"
	myHash "Modsec/clientside/CipherAlgo/utils"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"

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
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) SimplePOC(title string) {
	runtime.WindowSetTitle(a.ctx, title)
}

func (a *App) EmailToSHA256(email string) string {
	// This function turn email Sinto sha256
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
func (a *App) RegisterUser(email string, password string) (bool, error) {
	log.Println("Registration attempt for email:", email)

	// Generate master key from password
	masterKey := myHash.MasterPasswordGen(password)

	// Generate Sandwich hash for registration
	answer, iterations := myHash.SandwichRegisOP(password, email)

	// Convert byte arrays to base64 strings
	baseAnswer := make([]string, 0, len(answer))
	for _, b := range answer {
		baseAnswer = append(baseAnswer, myConvert.BytToBa64(b))
	}

	// Convert iterations to strings
	iterationStrings := make([]string, len(iterations))
	for i, num := range iterations {
		iterationStrings[i] = strconv.Itoa(num)
	}

	// Join the arrays into strings with delimiters
	hp1HpR := strings.Join(baseAnswer, "|")
	iterationString := strings.Join(iterationStrings, "|")

	// Generate initialization vector
	iv, err := myGenVal.GenerateIV()
	if err != nil {
		log.Printf("Failed to generate IV: %v", err)
		return false, err
	}

	// Generate session key
	sessionKey, err := myGenVal.GenerateSessionKey()
	if err != nil {
		log.Printf("Failed to generate session key: %v", err)
		return false, err
	}

	// Generate vault key
	vaultKey, err := myGenVal.GenerateSessionKey()
	if err != nil {
		log.Printf("Failed to generate vault key: %v", err)
		return false, err
	}

	// Encrypt Hp1-HpR with session key
	encryptedHp1HpR, err := myEncrypt.EncryptAES256GCM(hp1HpR, sessionKey, iv)
	if err != nil {
		log.Printf("Failed to encrypt Hp1-HpR: %v", err)
		return false, err
	}

	// Encrypt iterations with session key
	encryptedIteration, err := myEncrypt.EncryptAES256GCM(iterationString, sessionKey, iv)
	if err != nil {
		log.Printf("Failed to encrypt iterations: %v", err)
		return false, err
	}

	// Encrypt vault key with master key
	protectedVaultKey, err := myEncrypt.EncryptAES256GCM(string(vaultKey), masterKey, iv)
	if err != nil {
		log.Printf("Failed to encrypt vault key: %v", err)
		return false, err
	}

	// Create response data structure
	resData := DataStr.ResData{
		EncryptedHp1_HpR:   encryptedHp1HpR,
		EncryptedIteration: encryptedIteration,
		ProtectedVaultKey:  protectedVaultKey,
		Email:              email,
		IV:                 iv,
		Sessionkey:         sessionKey,
	}

	// Serialize data to JSON
	jsonResData, err := json.Marshal(resData)
	if err != nil {
		log.Printf("Failed to encode JSON: %v", err)
		return false, err
	}

	// TODO: Send data to your backend server
	// This would involve making an HTTP request to your registration endpoint
	// For now, we'll just log it
	log.Println("Registration data prepared:", string(jsonResData))

	// Simulate successful registration
	// In a real implementation, you would return the result from your API call
	return true, nil
}
