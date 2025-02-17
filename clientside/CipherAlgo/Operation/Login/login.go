package main

import (
	"fmt"
	myConvert "test/myGoLib/Convert"
	myEncrypt "test/myGoLib/Encrypt"
	myGenVal "test/myGoLib/Generate"
	myHash "test/myGoLib/Hashing"
)

func main() {
	// Testing simpler Sanwich Login Operation
	// I'm exhausted
	fmt.Println("===== Begin Operation =====")
	var myPassword string = "Whatsup"
	var myEmail string = "soMeth!ng@email.com"
	var myMessage string = "Something wong"
	fmt.Println("Test password:", myPassword)
	fmt.Println("Test Email:", myEmail)
	fmt.Println("Test Message", myMessage)

	MasterPasswordHash := myHash.MasterPasswordHashGen(myPassword)
	Masterkey := myHash.MasterPasswordGen(myPassword)
	Answer, Ran := myHash.SandwichLoginOP(myPassword, myEmail) //Already Fix

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	fmt.Println("Answer from PBKDF 8 time", Answer) //Hpt but without concat

	//Combine Hpt with Timestemp
	Time := myGenVal.GenerateTimestamp()

	// Converting Answer into String
	var BaseAnswer []string
	for _, b := range Answer {
		BaseAnswer = append(BaseAnswer, myConvert.BytToBa64(b))
	}

	//Test Print
	for i, z := range BaseAnswer {
		fmt.Printf("Salt %d: %s\n", i+1, z)
	}
	//HqT = BaseAnswer + Ran + Time

	//Creating Hq1-HqR,Bt
	Payload := myConvert.ConSaltsEmail(BaseAnswer, Time)

	fmt.Println("Printing Hq1-HqR", Payload)

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
