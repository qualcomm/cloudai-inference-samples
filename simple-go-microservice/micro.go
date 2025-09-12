//  Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
//  SPDX-License-Identifier: BSD-3-Clause
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the conditions in LICENSE.txt are met

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// handle the inbound request
func microHandler(w http.ResponseWriter, r *http.Request) {
	// must be a POST
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read customer feedback string from JSON in the POST body
	// return error if the body doesn't contain expected data
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Could not read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Now try to marshal the request data into JSON
	type requestData struct {
		Feedback string `json:"feedback"`
	}
	var data requestData
	err = json.Unmarshal(body, &data)

	if err != nil {
		fmt.Fprint(w, "no feedback to submitted to evaluate")
		return
	}
	if data.Feedback == "" {
		fmt.Fprint(w, "no feedback to submitted to evaluate")
	} else {
		feedback := evalFeedback(data.Feedback)
		fmt.Println(feedback)
		fmt.Fprintf(w, "feedback: %s", feedback)
	}
}

// evaluate a feedback string as positive, neutral, or negative
func evalFeedback(s string) string {
	fmt.Println(s)
	// build up the JSON request to our AI inference endpoint
	jsonStart := `{
		"model": "Llama-3.1-8B",
		"messages": [
			{
			"role": "System",
			"content": "You are an expert at sentiment analysis."
			},
			{
			"role": "User",
			"content": "Please evaluate the following customer feedback and answer only with positive, negative, or neutral. Only answer positive, negative, or neutral in lowercase. Feedback: '`
	jsonEnd := `'"
			}
		],
		"stream": false
		}`

	// now set up our request and make it
	url := os.Getenv("ENDPOINT")

	// concatenate the expected API json body with the feedback inserted
	payload := strings.NewReader(jsonStart + s + jsonEnd)

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+os.Getenv("API_KEY"))

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	// Define a struct matching the relevant JSON structure
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	// Unmarshal JSON into the struct
	if err := json.Unmarshal([]byte(string(body)), &result); err != nil {
		panic(err)
	}

	// Extract the content from the first choice's message
	content := result.Choices[0].Message.Content

	return content
}

// using net/http to do a very simple server for our microservice
func main() {
	// load up environment variables from the .env file
	// used to store our API endpoint and key
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	http.HandleFunc("/", microHandler)
	http.ListenAndServe(":8080", nil)
}
