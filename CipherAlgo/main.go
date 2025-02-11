package main

import (
	"fmt"
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

	// Creating Master key which is 32 byte(256) for AES256
	MasterKey := myHash.Argon2Function(myPassword, myHash.EmailToSHA256(myEmail))
	fmt.Println("Error generating IV:", MasterKey)
	// Creating Streact email hash with SHA256
	StreschEmailHash := myHash.EmailToSHA256(myEmail)
	iv, err := myGenVal.GenerateIV()
	if err != nil {
		fmt.Println("Error generating IV:", err)
		return
	}

	Plaintext := []byte(myPassword)

	Ciphertext, err := myEncrypt.EncryptAES256GCM(Plaintext, StreschEmailHash, iv)
	if err != nil {
		fmt.Println("Error Encrpyting AES", err)
		return
	}
	Translate := myConvert.BytToBa64(Ciphertext[:])
	fmt.Println("Encrypting successful", Ciphertext)
	fmt.Println("Translate from Encrypted byte: ", Translate)
	fmt.Println("===== End Operation =====")

	SomNumber, err := myGenVal.RandomInt(1000, 800000)
	if err != nil {
		fmt.Println("Error Encrpyting AES", err)
		return
	}
	fmt.Println("Translate from Encrypted byte: ", SomNumber)

}
