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
	Answer, Ran := myHash.SandwichRegisOP(myPassword, myEmail) //Hpt but without concat

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	//fmt.Println("Answer from PBKDF 8 time", Answer)

	var BaseAnswer []string
	for _, b := range Answer {
		BaseAnswer = append(BaseAnswer, myConvert.BytToBa64(b))
	}

	var result []string
	for _, num := range Ran {
		result = append(result, fmt.Sprintf("%d", num)) // Format the int as string and append
	}

	PackHpT := myConvert.ConCombineTime(BaseAnswer, result, myEmail) //Hp1-HpR+iteration+email

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
	fmt.Println("HpT:", PackHpT)
	fmt.Println("===== End Operation =====")
}
