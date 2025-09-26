package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()

	// Use env var DATABASE_URL or replace with your DB URL directly.
	// (This line was in your original code; it sets a default URL into env
	// then reads it. I kept it unchanged.)
	os.Setenv("DATABASE_URL", "https://this-world-of-mine-default-rtdb.asia-southeast1.firebasedatabase.app/")
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("set DATABASE_URL env var to your Realtime Database URL (e.g. https://<PROJECT>.firebaseio.com/)")
	}

	// Read credentials from env: prefer base64-encoded FIREBASE_SERVICE_ACCOUNT_B64.
	var credBytes []byte
	if b64 := os.Getenv("FIREBASE_SERVICE_ACCOUNT_B64"); b64 != "" {
		decoded, err := base64.StdEncoding.DecodeString(b64)
		if err != nil {
			log.Fatalf("failed to decode FIREBASE_SERVICE_ACCOUNT_B64: %v", err)
		}
		credBytes = decoded
	} else if raw := os.Getenv("FIREBASE_SERVICE_ACCOUNT"); raw != "" {
		// fallback if the dashboard preserves raw JSON; handle escaped newlines
		credBytes = []byte(strings.ReplaceAll(raw, `\n`, "\n"))
	} else {
		log.Fatal("no FIREBASE_SERVICE_ACCOUNT_B64 or FIREBASE_SERVICE_ACCOUNT env var set")
	}

	// Use credentials JSON directly (no file writes).
	opt := option.WithCredentialsJSON(credBytes)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	dbClient, err := app.DatabaseWithURL(ctx, databaseURL)
	if err != nil {
		log.Fatalf("failed to get database client: %v", err)
	}

	postsRef := dbClient.NewRef("posts")

	// tiny CORS helper
	withCORS := func(h http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Content-Type", "application/json")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			h(w, r)
		}
	}

	// GET /
	http.HandleFunc("/", withCORS(func(w http.ResponseWriter, r *http.Request) {
		var posts map[string]interface{}
		if err := postsRef.Get(r.Context(), &posts); err != nil {
			http.Error(w, `{"error":"failed to read posts"}`, http.StatusInternalServerError)
			return
		}
		if posts == nil {
			posts = map[string]interface{}{}
		}
		_ = json.NewEncoder(w).Encode(posts)
	}))

	// GET /search?q=term
	http.HandleFunc("/search", withCORS(func(w http.ResponseWriter, r *http.Request) {
		term := r.URL.Query().Get("q")

		// read into map of id -> post
		var posts map[string]map[string]interface{}
		if err := postsRef.Get(r.Context(), &posts); err != nil {
			http.Error(w, `{"error":"failed to read posts"}`, http.StatusInternalServerError)
			return
		}
		// if no posts return empty array
		if posts == nil {
			_ = json.NewEncoder(w).Encode([]interface{}{})
			return
		}

		// if no search term, return values array (like Object.values)
		if term == "" {
			out := make([]map[string]interface{}, 0, len(posts))
			for _, p := range posts {
				out = append(out, p)
			}
			_ = json.NewEncoder(w).Encode(out)
			return
		}

		filtered := []map[string]interface{}{}
		for _, p := range posts {
			title, _ := p["title"].(string)
			author, _ := p["author"].(string)
			if title == term || author == term {
				filtered = append(filtered, p)
			}
		}
		_ = json.NewEncoder(w).Encode(filtered)
	}))

	// POST /post
	http.HandleFunc("/post", withCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		var payload map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		id := uuid.New().String()
		newRef := postsRef.Child(id)
		if err := newRef.Set(r.Context(), payload); err != nil {
			http.Error(w, `{"error":"failed to write post"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
