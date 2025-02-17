package myHash

import (
	"crypto/sha256"
	"strings"
	myGenVal "test/myGoLib/Generate"

	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/pbkdf2"
)

func Argon2Function(password string, salt []byte, keyLen uint32) []byte {
	// This function turn into hash using Argon2
	// This will be used to turn Email to master key and doin some other operation

	// Input as string
	// Output as byte
	// Argon2id parameters
	const (
		time    = 1         // Number of iterations
		memory  = 64 * 1024 // Memory usage (64MB)
		threads = 4         // Number of parallel threads
		// keyLen  = 32        // Length of the generated key (256-bit)
	)

	// Generate the Argon2id hash
	hash := argon2.IDKey([]byte(password), salt, time, memory, threads, keyLen)
	return hash //(As 256 bits)
}

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

func PBKDF2Function(password, salt []byte, iterations, keyLength int) []byte {
	// Input: Password(Str) Salt(Str) Iteration(int) Keylength(int) <== Depend on algorithm we use
	// Output as string(Base64)
	// Doing funky hashing by using sha256(For now)
	key := pbkdf2.Key(password, salt, iterations, keyLength, sha256.New)

	// Return the key as a base64 string
	return key
}

func MasterPasswordHashGen(Password string) []byte {
	MasterPassword := Argon2Function(Password, nil, 32) // 32 byte or 256 bit(MUST BE ONLY)
	HashedMasterPassword := sha256.Sum256(MasterPassword)
	return HashedMasterPassword[:]
}

func MasterPasswordGen(Password string) []byte {
	MasterPassword := Argon2Function(Password, nil, 32) // 32 byte or 256 bit(MUST BE ONLY)
	return MasterPassword[:]
}

func SandwichRegisOP(Password, Email string) (Answer [][]byte) {
	// Sanswich
	HashMasterPassword := MasterPasswordHashGen(Password) // 32 byte or 256 bit(MUST BE ONLY)
	StreschEmailHash := Argon2Function(Email, nil, 256)   // 256 byte or 2048 bit
	var chunks [][]byte

	//Slice StreschEmailHash into 32 byte each (32 * 8 block)
	for i := 0; i < len(StreschEmailHash); i += 32 {
		end := i + 32
		if end > len(StreschEmailHash) {
			end = len(StreschEmailHash)
		}
		chunks = append(chunks, StreschEmailHash[i:end])
	}

	for i := 0; i < 8; i++ {
		RandNum := myGenVal.RandomInt(60000, 800000)
		// Predefine the Value Regis 60k - 800k
		// Loging 1k - 60k-1
		derivedKey := PBKDF2Function(HashMasterPassword, chunks[i], RandNum, 32)
		Answer = append(Answer, derivedKey)
	}

	return Answer
	// Number of iteration = 1000 <= n <= 800000
	// iteration need to be a random number value

	// Do it about 8 time

	// Salts PBKDF2 use stretch Email by dividing in to something (8 section)
	// Lowest PBKDF2 size use 8 byte(length) of salt for 1 block (64 byte for 8 block)
}

func SandwichLoginOP(Password, Email string) (Answer [][]byte) {
	// Sanswich
	HashMasterPassword := MasterPasswordHashGen(Password) // 32 byte or 256 bit(MUST BE ONLY)
	StreschEmailHash := Argon2Function(Email, nil, 256)   // 256 byte or 2048 bit
	var chunks [][]byte

	//Slice StreschEmailHash into 32 byte each (32 * 8 block)
	for i := 0; i < len(StreschEmailHash); i += 32 {
		end := i + 32
		if end > len(StreschEmailHash) {
			end = len(StreschEmailHash)
		}
		chunks = append(chunks, StreschEmailHash[i:end])
	}

	for i := 0; i < 8; i++ {
		RandNum := myGenVal.RandomInt(1000, 59999)
		// Predefine the Value Regis 60k - 800k
		// Loging 1k - 60k-1
		derivedKey := PBKDF2Function(HashMasterPassword, chunks[i], RandNum, 32)
		Answer = append(Answer, derivedKey)
	}

	return Answer
	// Number of iteration = 1000 <= n <= 800000
	// iteration need to be a random number value

	// Do it about 8 time

	// Salts PBKDF2 use stretch Email by dividing in to something (8 section)
	// Lowest PBKDF2 size use 8 byte(length) of salt for 1 block (64 byte for 8 block)
}
