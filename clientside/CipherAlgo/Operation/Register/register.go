package main

import (
	"fmt"
	"log"
	"strconv"
	myConvert "test/myGoLib/Convert"
	myEncrypt "test/myGoLib/Encrypt"
	myGenVal "test/myGoLib/Generate"
	myHash "test/myGoLib/Hashing"
)

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

	MasterPasswordHash := myHash.MasterPasswordHashGen(myPassword)
	Masterkey := myHash.MasterPasswordGen(myPassword)
	Answer, Ran := myHash.SandwichRegisOP(myPassword, myEmail) //Hpt but without concat

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	//fmt.Println("Answer from PBKDF 8 time", Answer)

	BaseAnswer := make([]string, 0, len(Answer)) // Initilization and size allocation for better performance
	for _, b := range Answer {
		BaseAnswer = append(BaseAnswer, myConvert.BytToBa64(b))
	}

	// Convert Ran numbers to strings
	result := make([]string, len(Ran))
	for i, num := range Ran {
		result[i] = strconv.Itoa(num)
	}

	// Combine hashes with time and email
	PackHpT := myConvert.ConCombineTime(BaseAnswer, result, myEmail)

	// Generate IV and encrypt data
	iv, err := myGenVal.GenerateIV()
	if err != nil {
		log.Fatalf("Failed to generate IV: %v", err) //
	}

	// Encrypt master password hash
	Ciphertext, err := myEncrypt.EncryptAES256GCM(Masterkey, MasterPasswordHash, iv)
	if err != nil {
		log.Fatalf("Failed to encrypt master password hash: %v", err)
	}

	// Encrypt combined hash data
	EncryptHpt, err := myEncrypt.EncryptAES256GCM(Masterkey, []byte(PackHpT), iv)
	if err != nil {
		log.Fatalf("Failed to encrypt HpT: %v", err)
	}

	// Convert to base64 for output
	encryptedBase64 := myConvert.BytToBa64(Ciphertext[:])

	// Output results
	fmt.Printf("Encryption successful. Ciphertext length: %d bytes\n", len(Ciphertext))
	fmt.Printf("Base64 encoded ciphertext: %s\n", encryptedBase64)
	fmt.Printf("HpT hash: %s\n", PackHpT)
	fmt.Printf("Encrypted HpT length: %d bytes\n", len(EncryptHpt))
	fmt.Println("===== End Operation =====")
}
