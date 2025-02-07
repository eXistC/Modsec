package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"

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

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
func emailToSHA256(email string) string {
	// This function turn email into sha256
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

func PBKDF2Function(password, salt string, iterations, keyLength int) string {
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

func generateRandomBytes(size int) ([]byte, error) {
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

func generateIV() ([]byte, error) {
	// Request: generateRandomBytes function
	//
	return generateRandomBytes(12) // Returns raw 12 byte (96)
}

func generateSessionKey() ([]byte, error) {
	// Request: generateRandomBytes function
	//
	return generateRandomBytes(32) // Returns raw 32 byte (256)
}

func encryptAES256GCM(plaintext []byte, key []byte, IV []byte) ([]byte, error) {
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
func decryptAES256GCM(ciphertext []byte, key []byte, IV []byte) ([]byte, error) {
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

// func main() {
// 	var myPassword string = "Whatsup"
// 	var myEmail string = "soMeth!ng@email.com"
// 	var myMessage string = "Something wong"
// 	fmt.Println("Test password:", myPassword)
// 	fmt.Println("Test Email:", myEmail)
// 	fmt.Println("Test Message", myMessage)
// 	// Creating Master key which is 32 byte(256) for AES256
// 	MasterKey := PBKDF2Function(myPassword, string(emailToSHA256(myEmail)), 1, 32)
// 	fmt.Println("Master key: 256 bits", MasterKey)

// 	// Creating Streact email hash with SHA256
// 	StreschEmailHash := emailToSHA256(myEmail)
// 	fmt.Println("StreschEmailHash:", StreschEmailHash)

// 	// Creating Session key which is 32 byte(256) for AES256
// 	sessionKey, err := generateSessionKey()
// 	if err != nil {
// 		fmt.Println("Error generating session key:", err)
// 		return
// 	}
// 	fmt.Println("Session Key (byte) 256 bits:", sessionKey)

// 	// Creating IV for AES256 which is 12 byte(96)
// 	iv, err := generateIV()
// 	if err != nil {
// 		fmt.Println("Error generating IV:", err)
// 		return
// 	}
// 	fmt.Println("IV (byte) 96 bits:", iv)

// 	//AES Encrypting
// 	Plaintext := []byte(myMessage)
// 	Ciphertext, err := encryptAES256GCM(Plaintext, sessionKey, iv)
// 	if err != nil {
// 		fmt.Println("Error Encrpyting AES", err)
// 		return
// 	}
// 	Translate := hex.EncodeToString(Ciphertext[:])
// 	fmt.Println("Transgender: ", Translate)
// 	fmt.Println("Encrypting successful", Ciphertext)
// 	//Decrypting
// 	Deciphertext, err := decryptAES256GCM(Ciphertext, sessionKey, iv)
// 	if err != nil {
// 		fmt.Println("Error Encrpyting AES", err)
// 		return
// 	}
// 	Translate = string(Deciphertext)
// 	fmt.Println("Decrypting successful", Translate)
// }
