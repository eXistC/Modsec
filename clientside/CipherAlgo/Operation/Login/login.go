package main

import (
	"fmt"
	myConvert "test/myGoLib/Convert"
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
	EmailHash := myHash.EmailToSHA256(myEmail)

	//Combine Hpt with Timestemp
	Time := myGenVal.GenerateTimestamp()

	// Converting Answer into String
	var BaseAnswer []string
	for _, b := range Answer {
		BaseAnswer = append(BaseAnswer, myConvert.BytToBa64(b))
	}
	//Creating HqT = BaseAnswer + Ran + Time
	var result []string
	for _, num := range Ran {
		result = append(result, fmt.Sprintf("%d", num)) // Format the int as string and append
	}
	PackHqT := myConvert.ConCombineTime(BaseAnswer, result, Time)

	Output := myHash.Argon2Function(PackHqT, nil, 32)
	PackHqT = myConvert.BytToBa64(Output)
	//Creating Hq1-HqR,Bt
	PackHqPayload := myConvert.ConSaltsEmail(BaseAnswer, Time)

	fmt.Println("Master Password Hash", MasterPasswordHash)
	fmt.Println("Master Key", Masterkey)
	fmt.Println("Email Hash with SHA256", EmailHash)
	fmt.Println("Answer from PBKDF 8 time", Answer) //Hpt but without concat
	fmt.Println("\nPrinting Hq1-HqR", PackHqPayload, "\n")
	fmt.Println("Printing HqT", PackHqT, "\n")

	fmt.Println("===== End Operation =====")
}
