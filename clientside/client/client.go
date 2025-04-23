package client

import (
	"net/http"
	"net/http/cookiejar"
)

var SharedClient *http.Client

func init() {
	jar, _ := cookiejar.New(nil)
	SharedClient = &http.Client{
		Jar: jar,
	}
}
