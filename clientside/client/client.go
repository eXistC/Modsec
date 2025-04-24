package client

import (
	"net/http"
	"net/http/cookiejar"
)

var HMClient *http.Client

func InitClient() {
	jar, _ := cookiejar.New(nil)
	HMClient = &http.Client{
		Jar: jar,
	}
}
