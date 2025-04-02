package main

import (
	"Modsec/clientside/CipherAlgo/utils"
	"fmt"
	"strconv"
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

	MasterPasswordHash := utils.MasterPasswordHashGen(myPassword)
	Masterkey := utils.MasterPasswordGen(myPassword, myEmail)
	Answer, Ran := utils.SandwichLoginOP(myPassword, myEmail) //Already Fix
	EmailHash := utils.EmailToSHA256(myEmail)

	//Combine Hpt with Timestemp
	Time := utils.GenerateTimestamp()

	// Convert Answer bytes to base64 strings
	BaseAnswer := make([]string, len(Answer))
	for i, b := range Answer {
		BaseAnswer[i] = utils.BytToBa64(b) // Faster than append
	}

	// Convert random numbers to strings for HqT creation
	result := make([]string, len(Ran)) // Since we know the length of Ran, we can allocate the size for better performance
	for i, num := range Ran {
		result[i] = strconv.Itoa(num) // strconv is faster than append
	}
	PackHqT := utils.ConCombineTime(BaseAnswer, result, Time)
	fmt.Println("PackHqT", PackHqT)

	Output := utils.Argon2Function(PackHqT, nil, 32)
	PackHqT = utils.BytToBa64(Output)
	//Creating Hq1-HqR,Bt
	PackHqPayload := utils.ConSaltsEmail(BaseAnswer, Time)

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	fmt.Println("Email Hash with SHA256", EmailHash)
	fmt.Println("Answer from PBKDF 8 time", Answer) //Hpt but without concat
	fmt.Println("\nPrinting Hq1-HqR", PackHqPayload, "\n")
	fmt.Println("Printing HqT", PackHqT, "\n")

	fmt.Println("===== End Operation =====")
}
