package utils

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/tyler-smith/go-bip39"
)

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

func RandomInt(min, max int) int {
	if min >= max {
		return 0
	}

	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(max-min+1)))
	if err != nil {
		return 0
	}

	return int(nBig.Int64()) + min
}

func GenerateTimestamp() string {
	return time.Now().Format("20060102150405")
}

func RandomSeedPhrase() string {
	// Generate 128 bits (16 bytes) of entropy (12 word)
	entropy, err := bip39.NewEntropy(128)
	if err != nil {
		log.Fatal(err)
	}
	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		log.Fatal(err)
	}
	return mnemonic
}
