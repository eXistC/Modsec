package DataStr

type Data struct {
	EncryptedHp1_HpR   string `json:"encrypted_hp1_hpr"`
	EncryptedIteration string `json:"encrypted_iteration"`
	ProtectedVaultKey  string `json:"protected_vault_key"`
	Email              string `json:"email"`
}
