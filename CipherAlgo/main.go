package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/pbkdf2"
)

// Base 64 to Byte
func Ba64ToByt(base64Str string) ([]byte, error) {
	bytes, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64: %w", err)
	}
	return bytes, nil
}

// Byte to Base 64
func BytToBa64(bytes []byte) string {
	return base64.StdEncoding.EncodeToString(bytes)
}

func Argon2Function(password string, salt []byte) []byte {
	// This function turn into hash using Argon2
	// This will be used to turn Email to master key and doin some other operation

	// Input as string
	// Output as byte
	// Argon2id parameters
	const (
		time    = 1         // Number of iterations
		memory  = 64 * 1024 // Memory usage (64MB)
		threads = 4         // Number of parallel threads
		keyLen  = 32        // Length of the generated key (256-bit)
	)

	// Generate the Argon2id hash
	hash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLen)
	return hash //(As 256 bits)
}

// This function turn email Sinto sha256 which will be used as salt in the future. or maybe store in database
func EmailToSHA256(email string) []byte {
	// Input as string
	// Output as byte

	// Trimming spaces and converting to lowercase
	// This maybe removed in the future if raise concern!
	normalizedEmail := strings.TrimSpace(strings.ToLower(email))

	// Hash the email using SHA-256
	emailHash := sha256.Sum256([]byte(normalizedEmail))

	// Convert the hash to a hexadecimal string
	// If you need to use it as salt you may convert into byte
	return emailHash[:]
}

// This function is for PBKDF2. It use SHA256 to do the hashing and the number of iteration can be control
func PBKDF2Function(password, salt string, iterations, keyLength int) string {
	// Input: Password(Str) Salt(Str) Iteration(int) Keylength(int) <== Depend on algorithm we use
	// Output as string(Base64)

	// Convert password and salt to byte slices
	passwordBytes := []byte(password)
	saltBytes := []byte(salt)

	// Doing funky hashing by using sha256(For now)
	key := pbkdf2.Key(passwordBytes, saltBytes, iterations, keyLength, sha256.New)

	// Return the key as a base64 string
	return BytToBa64(key)
}

// This performs a PBKDF2 witch each iteration corresponding to each salts.
func ModdedPBKDF2(payload []byte, saltChain [][]byte, keyLength int) []byte {
	// Inputs: payload(byte) saltChain (Array of byte) keyLength (int 32)
	// Outputs: finalKey(byte)

	if len(saltChain) == 0 {
		return nil // Avoid processing if no salts
	}

	var finalKey []byte // Store XOR'd final key

	for i, salt := range saltChain {
		// Derive key using PBKDF2 with one iteration per salt
		derivedKey := pbkdf2.Key(payload, salt, 1, keyLength, sha256.New)

		if i == 0 {
			finalKey = derivedKey // Set the base key for the first iteration
		} else {
			// XOR current derived key with previous result
			for j := range finalKey {
				finalKey[j] ^= derivedKey[j]
			}
		}
	}
	// Return the final key and the salts used
	return finalKey
}

func GenerateRandomBytes(size int) ([]byte, error) {
	// Create a byte slice to hold the random bytes
	// This function will be used with generateIV and GenerateSessionkey
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

func GenerateIV() ([]byte, error) {
	// Request: GenerateRandomBytes function
	//
	return GenerateRandomBytes(12) // Returns raw 12 byte (96)
}

func GenerateSessionKey() ([]byte, error) {
	// Request: GenerateRandomBytes function
	//
	return GenerateRandomBytes(32) // Returns raw 32 byte (256)
}

func GenerateSalts() ([]byte, error) {
	// Request: GenerateRandomBytes function
	return GenerateRandomBytes(32) // Returns raw 32 byte (256)
}

func GenerateSaltsChain(number int) ([][]byte, error) {
	var saltChain [][]byte // Store all salts used during iterations
	for i := 0; i < number; i++ {
		// Generate a new salt for each iteration
		salt, err := GenerateSalts()
		if err != nil {
			panic("Failed to generate salt") // Handle error properly in real implementation
		}

		saltChain = append(saltChain, salt)
	}
	return saltChain, nil
}

func EncryptAES256GCM(plaintext []byte, key []byte, IV []byte) ([]byte, error) {
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
func DecryptAES256GCM(ciphertext []byte, key []byte, IV []byte) ([]byte, error) {
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

func ConvertToStrSaltChain(byteArray [][]byte) []string {
	var stringArray []string
	for _, Bbyte := range byteArray {
		stringArray = append(stringArray, BytToBa64(Bbyte))
	}
	return stringArray
}

func ConvertToBytSaltChain(stringArray []string) ([][]byte, error) {
	var byteArray [][]byte
	for _, Sstring := range stringArray {
		decoded, err := Ba64ToByt(Sstring)
		if err != nil {
			return nil, fmt.Errorf("failed to decode base64 string: %w", err)
		}
		byteArray = append(byteArray, decoded)
	}
	return byteArray, nil
}

func ConSaltsEmail(saltStrings []string, email string) string {
	return strings.Join(saltStrings, "|") + "|" + email
}

// Split concatenated string back into salts and email
func SplitSaltsEmail(concatenated string) ([]string, string, error) {
	parts := strings.Split(concatenated, "|")
	if len(parts) < 2 {
		return nil, "", fmt.Errorf("invalid concatenated format")
	}

	// The last element is the email, the rest are salts
	salts := parts[:len(parts)-1]
	email := parts[len(parts)-1]
	return salts, email, nil
}

func SandwichRegisOP() {

}

func main() {
	// Testing simpler Sanwich Registeration Operation
	// I'm tired
	fmt.Println("===== Begin Operation =====")
	var myPassword string = "Whatsup"
	var myEmail string = "soMeth!ng@email.com"
	var myMessage string = "Something wong"
	fmt.Println("Test password:", myPassword)
	fmt.Println("Test Email:", myEmail)
	fmt.Println("Test Message", myMessage)

	// Creating Master key which is 32 byte(256) for AES256
	MasterKey := Argon2Function(myPassword, EmailToSHA256(myEmail))
	// Creating Streact email hash with SHA256
	StreschEmailHash := EmailToSHA256(myEmail)
	SaltChain, err := GenerateSaltsChain(32)
	if err != nil {
		fmt.Println("Error generating IV:", err)
		return
	}
	iv, err := GenerateIV()
	if err != nil {
		fmt.Println("Error generating IV:", err)
		return
	}

	Result := ModdedPBKDF2(MasterKey, SaltChain, 32) // This suppose to use StreschEmailHash as a salt
	var StringSaltChain []string = ConvertToStrSaltChain(SaltChain)

	concated := ConSaltsEmail(StringSaltChain, myEmail)
	fmt.Println("Concat result:\n", concated)
	Plaintext := []byte(concated)

	Ciphertext, err := EncryptAES256GCM(Plaintext, StreschEmailHash, iv)
	if err != nil {
		fmt.Println("Error Encrpyting AES", err)
		return
	}
	Translate := BytToBa64(Ciphertext[:])
	fmt.Println("Encrypting successful", Ciphertext)
	fmt.Println("Translate from Encrypted byte: ", Translate)
	fmt.Println("Result from modded PBKDF: ", Result)
	fmt.Println("===== End Operation =====")
}
