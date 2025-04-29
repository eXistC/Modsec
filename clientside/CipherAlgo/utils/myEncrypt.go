package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"fmt"
)

// Input byte Out as byte
func EncryptAES256GCM(plaintext, key []byte) ([]byte, error) {
	// AES256 using GCM mode
	// Input: plaintext(byte) Key 32 byte
	// Output: Ciphertext//IV 12 byte as byte
	if len(key) != 32 {
		return nil, fmt.Errorf("invalid key length: expected 32, got %d", len(key))
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM mode: %w", err)
	}

	IV, err := GenerateIV()
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM mode: %w", err)
	}

	// Encrypt the plaintext using the provided IV
	ciphertext := gcm.Seal(IV, IV, plaintext, nil)

	// Return only the ciphertext (nonce should be stored separately)
	return ciphertext, nil
}

// Return Byte, Error use to Decrypt data(Byte)
func DecryptAES256GCM(ciphertext, key []byte) ([]byte, error) {
	// AES256 using GCM mode
	// Input: ciphertext(byte) Key 32(byte)
	// Output: byte
	if len(key) != 32 {
		return nil, fmt.Errorf("invalid key length: expected 32, got %d", len(key))
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM mode: %w", err)
	}

	// Extract IV from Cipher text
	IVSize := gcm.NonceSize()
	if len(ciphertext) < IVSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	IV, EncryptedData := ciphertext[:IVSize], ciphertext[IVSize:]
	// Decrypt the ciphertext using the provided nonce
	plaintext, err := gcm.Open(nil, IV, EncryptedData, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt ciphertext: %w", err)
	}

	return plaintext, nil
}
