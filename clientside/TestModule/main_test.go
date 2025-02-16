package main

// cd clientside/TestModule
// go test -v

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type Message struct {
	Content string `json:"content"`
}

const (
	serverURL = "http://localhost:8080"
	timeout   = 5 * time.Second
)

func TestClientServerIntegration(t *testing.T) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: timeout,
	}

	t.Run("Test POST /message", func(t *testing.T) {
		// Prepare test message
		message := Message{
			Content: "Test message from integration test",
		}

		jsonData, err := json.Marshal(message)
		assert.NoError(t, err)

		// Create request
		req, err := http.NewRequest(
			http.MethodPost,
			serverURL+"/message",
			bytes.NewBuffer(jsonData),
		)
		assert.NoError(t, err)

		req.Header.Set("Content-Type", "application/json")

		// Send request
		resp, err := client.Do(req)
		if err != nil {
			t.Fatalf("Failed to send request: %v", err)
		}
		defer resp.Body.Close()

		// Check response
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response Message
		err = json.NewDecoder(resp.Body).Decode(&response)
		assert.NoError(t, err)

		expectedContent := "Server received: Test message from integration test"
		assert.Equal(t, expectedContent, response.Content)
	})
}
