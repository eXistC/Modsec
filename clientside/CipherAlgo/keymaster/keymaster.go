package keymaster

// This will be critical part for encryption act similar to global varible but only function that has this package
// can access these key

var Masterkey []byte
var Vaultkey []byte
var Sessionkey []byte

func GetSessionkey() []byte {
	return Sessionkey
}

func GetMasterkey() []byte {
	return Masterkey
}

func GetVaultkey() []byte {
	return Vaultkey
}

// func ExtractVaultKey(EnVaultkey []byte, key []byte, IV []byte) error {
// 	var err error
// 	Vaultkey, err = utils.DecryptAES256GCM(EnVaultkey, key, IV)
// 	return err
// }
