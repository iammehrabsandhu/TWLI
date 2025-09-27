package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/db"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

var (
	dbClient *db.Client
	dbMu     sync.RWMutex

	initOnce sync.Once
	initErr  error
	initDone = make(chan struct{}) // closed when init finished (success or fail)
)

const defaultDatabaseURL = "https://this-world-of-mine-default-rtdb.asia-southeast1.firebasedatabase.app/"

// initFirebase performs Firebase initialization and stores dbClient (or initErr).
// It is safe to call multiple times; sync.Once ensures single init (we still allow goroutine start).
func initFirebase() {
	initOnce.Do(func() {
		defer close(initDone) // signal completion (success or failure)

		ctx := context.Background()

		// DATABASE_URL from env, fallback to default if not set
		databaseURL := os.Getenv("DATABASE_URL")
		if databaseURL == "" {
			databaseURL = defaultDatabaseURL
			log.Printf("DATABASE_URL not set — falling back to default: %s", databaseURL)
		}

		// Read credentials from env: prefer base64-encoded FIREBASE_SERVICE_ACCOUNT_B64.
		var credBytes []byte
		if b64 := os.Getenv("FIREBASE_SERVICE_ACCOUNT_B64"); b64 != "" {
			decoded, err := base64.StdEncoding.DecodeString(b64)
			if err != nil {
				initErr = fmt.Errorf("failed to decode FIREBASE_SERVICE_ACCOUNT_B64: %w", err)
				return
			}
			credBytes = decoded
		} else if raw := os.Getenv("FIREBASE_SERVICE_ACCOUNT"); raw != "" {
			credBytes = []byte(strings.ReplaceAll(raw, `\n`, "\n"))
		} else {
			initErr = fmt.Errorf("no FIREBASE_SERVICE_ACCOUNT_B64 or FIREBASE_SERVICE_ACCOUNT env var set")
			return
		}

		opt := option.WithCredentialsJSON(credBytes)
		app, err := firebase.NewApp(ctx, nil, opt)
		if err != nil {
			initErr = fmt.Errorf("error initializing firebase app: %w", err)
			return
		}

		client, err := app.DatabaseWithURL(ctx, databaseURL)
		if err != nil {
			initErr = fmt.Errorf("failed to get database client: %w", err)
			return
		}

		dbMu.Lock()
		dbClient = client
		dbMu.Unlock()

		log.Printf("firebase initialized and database client ready")
	})
}

func getDBClient() *db.Client {
	dbMu.RLock()
	defer dbMu.RUnlock()
	return dbClient
}

func main() {
	// kick off firebase init in background immediately (so we can bind the port ASAP)
	go initFirebase()

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

	// health endpoint: 200 when init finished & successful, 500 if init failed, 503 while initializing
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-initDone:
			if initErr != nil {
				http.Error(w, fmt.Sprintf("init error: %v", initErr), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("ok"))
			return
		default:
			http.Error(w, "initializing", http.StatusServiceUnavailable)
			return
		}
	})

	// GET /
	http.HandleFunc("/", withCORS(func(w http.ResponseWriter, r *http.Request) {
		client := getDBClient()
		if client == nil {
			http.Error(w, `{"error":"service initializing"}`, http.StatusServiceUnavailable)
			return
		}
		postsRef := client.NewRef("posts")
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
		client := getDBClient()
		if client == nil {
			http.Error(w, `{"error":"service initializing"}`, http.StatusServiceUnavailable)
			return
		}
		term := r.URL.Query().Get("q")

		// read into map of id -> post
		postsRef := client.NewRef("posts")
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
		client := getDBClient()
		if client == nil {
			http.Error(w, `{"error":"service initializing"}`, http.StatusServiceUnavailable)
			return
		}
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
		newRef := client.NewRef("posts").Child(id)
		if err := newRef.Set(r.Context(), payload); err != nil {
			http.Error(w, `{"error":"failed to write post"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}))

	// Respect PORT env var if present (useful on many hosting platforms)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	addr := "0.0.0.0:" + port
	log.Printf("listening on %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
