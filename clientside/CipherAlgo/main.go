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

	MasterPasswordHash := myHash.MasterPasswordHashGen(myPassword)
	Masterkey := myHash.MasterPasswordGen(myPassword)
	//Answer := myHash.SandwichRegisOP(myPassword, myEmail)

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	//fmt.Println("Answer from PBKDF 8 time", Answer)

	iv, err := myGenVal.GenerateIV()
	if err != nil {
		fmt.Println("Error Encrpyting AES", err)
		return
	}
	Ciphertext, err := myEncrypt.EncryptAES256GCM(Masterkey, MasterPasswordHash, iv)
	if err != nil {
		fmt.Println("Error Encrpyting AES", err)
		return
	}
	Translate := myConvert.BytToBa64(Ciphertext[:])
	fmt.Println("Encrypting successful", Ciphertext)
	fmt.Println("Translate from Encrypted byte: ", Translate)
	fmt.Println("===== End Operation =====")
}
