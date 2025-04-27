package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/pem"
	"errors"
)

// This will require server to load Env file first

// Parse RSA PRIVATE KEY
func ParsePrivateKey(pemStr string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		return nil, errors.New("failed to decode PEM block containing private key")
	}
	return x509.ParsePKCS1PrivateKey(block.Bytes)
}

// Parse PUBLIC KEY
func ParsePublicKey(pemStr string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil || block.Type != "PUBLIC KEY" {
		return nil, errors.New("failed to decode PEM block containing public key")
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not RSA public key")
	}
	return rsaPub, nil
}

func EncryptWithPublicKey(pub *rsa.PublicKey, msg []byte) ([]byte, error) {
	label := []byte("") // optional, can be empty
	hash := sha256.New()

	return rsa.EncryptOAEP(hash, rand.Reader, pub, msg, label)
}

func DecryptWithPrivateKey(priv *rsa.PrivateKey, ciphertext []byte) ([]byte, error) {
	label := []byte("") // must be same as in encryption
	hash := sha256.New()

	return rsa.DecryptOAEP(hash, rand.Reader, priv, ciphertext, label)
}
