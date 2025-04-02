package main

import (
	"Modsec/clientside/CipherAlgo/Operation/DataStr"
	"Modsec/clientside/CipherAlgo/utils"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
)

func main() {
	// Testing simpler Sanwich Registeration Operation
	// I'm tired
	fmt.Println("===== Begin Operation =====")
	var myPassword string = "12345678"
	var myEmail string = "soMeth!ng@email.com"
	var myMessage string = "Something wong"
	fmt.Println("Test password:", myPassword)
	fmt.Println("Test Email:", myEmail)
	fmt.Println("Test Message", myMessage)

	fmt.Println("===== Data send =====")
	//MasterPasswordHash := myHash.MasterPasswordHashGen(myPassword)
	Masterkey := utils.MasterPasswordGen(myPassword, myEmail)
	Answer, Ran := utils.SandwichRegisOP(myPassword, myEmail) //Hpt but without concat

	//fmt.Println("Master Password Hash", MasterPasswordHash)
	//fmt.Println("Master Key", Masterkey)
	//fmt.Println("Answer from PBKDF 8 time", Answer)

	BaseAnswer := make([]string, 0, len(Answer)) // Initilization and size allocation for better performance
	for _, b := range Answer {
		BaseAnswer = append(BaseAnswer, utils.BytToBa64(b))
	}

	// Convert Ran numbers to strings
	result := make([]string, len(Ran))
	for i, num := range Ran {
		result[i] = strconv.Itoa(num)
	}

	// Each data send to server
	Hp1_HpR := strings.Join(BaseAnswer, "|")
	Iteration := strings.Join(result, "|")
	//myEmail string = "soMeth!ng@email.com"

	// Generate IV and encrypt data
	iv, err := utils.GenerateIV()
	if err != nil {
		log.Fatalf("Failed to generate IV: %v", err)
	}

	sessionkey, err := utils.GenerateSessionKey()
	if err != nil {
		log.Fatalf("Failed to generate sessionkey: %v", err)
	}

	vaultkey, err := utils.GenerateSessionKey()
	if err != nil {
		log.Fatalf("Failed to generate vaultkey: %v", err)
	}

	// Encrypt master password hash
	// Ciphertext, err := myEncrypt.EncryptAES256GCM(Masterkey, MasterPasswordHash, iv)
	// if err != nil {
	// 	log.Fatalf("Failed to encrypt master password hash: %v", err)
	// }

	//Note: Key is MasterPasswordHash but need to be Randomnum
	// Encrypt Hp1-HpR
	EncryptedHp1_HpR, err := utils.EncryptAES256GCM(Hp1_HpR, sessionkey, iv)
	if err != nil {
		log.Fatalf("Failed to encrypt Hp1-HpR: %v", err)
	}

	// Encrypt combined hash data
	EncryptedIteration, err := utils.EncryptAES256GCM(Iteration, sessionkey, iv)
	if err != nil {
		log.Fatalf("Failed to encrypt Iteration: %v", err)
	}

	Protectedvaultkey, err := utils.EncryptAES256GCM(string(vaultkey), Masterkey, iv)
	if err != nil {
		log.Fatalf("Failed to encrypt vaultkey: %v", err)
	}

	resData := DataStr.ResData{
		EncryptedHp1_HpR:   EncryptedHp1_HpR,
		EncryptedIteration: EncryptedIteration,
		ProtectedVaultKey:  Protectedvaultkey,
		Email:              myEmail,
		IV:                 iv,
		Sessionkey:         sessionkey,
	}

	jsonresData, err := json.Marshal(resData)
	if err != nil {
		log.Fatalf("Failed to encode JSON: %v", err)
	}

	// Output results
	//fmt.Printf("Encryption successful. Ciphertext length: %d bytes\n", len(Ciphertext))
	//fmt.Printf("Base64 encoded ciphertext: %s\n", encryptedBase64)
	fmt.Println("Encoded JSON:", string(jsonresData))

	fmt.Println("===== End Operation =====")
	fmt.Printf("Hp1-HpR: %s\n", Hp1_HpR)
	fmt.Printf("Iteration: %s\n", Iteration)
	fmt.Println("Sessionkey:", vaultkey)
}
