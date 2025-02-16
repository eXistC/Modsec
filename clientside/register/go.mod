module test/register

replace test => ../CipherAlgo

go 1.23.5

toolchain go1.23.6

require test v0.0.0-00010101000000-000000000000

require (
	golang.org/x/crypto v0.33.0 // indirect
	golang.org/x/sys v0.30.0 // indirect
)
