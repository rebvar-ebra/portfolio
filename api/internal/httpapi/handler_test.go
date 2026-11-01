package httpapi_test

import (
	"bufio"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/rebvar/rebvar-studio/api/internal/httpapi"
	"github.com/rebvar/rebvar-studio/api/internal/orders"
)

func newTestHandler(t *testing.T, rateLimit int) http.Handler {
	t.Helper()
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	return httpapi.NewHandler(service, httpapi.Config{
		AllowedOrigin: "https://rebvar.xyz",
		ResetToken:    "test-reset-token",
		RateLimit:     rateLimit,
		RateWindow:    time.Minute,
	})
}

func TestTrustedProxyVisitorsReceiveIndependentRateBudgets(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	handler := httpapi.NewHandler(service, httpapi.Config{
		AllowedOrigin:     "https://rebvar.xyz",
		ResetToken:        "test-reset-token",
		RateLimit:         1,
		RateWindow:        time.Minute,
		TrustedProxyCIDRs: []string{"10.0.0.0/8"},
	})

	request := func(visitor string) int {
		req := httptest.NewRequest(http.MethodGet, "/api/orders", nil)
		req.RemoteAddr = "10.2.0.5:4123"
		req.Header.Set("X-Forwarded-For", visitor)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		return res.Code
	}

	if got := request("198.51.100.10"); got != http.StatusOK {
		t.Fatalf("first visitor expected 200, got %d", got)
	}
	if got := request("203.0.113.20"); got != http.StatusOK {
		t.Fatalf("second visitor should have independent budget, got %d", got)
	}
	if got := request("198.51.100.10"); got != http.StatusTooManyRequests {
		t.Fatalf("first visitor expected 429 after own budget, got %d", got)
	}
}

func TestTrustedProxyUsesNearestUntrustedForwardedAddress(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	handler := httpapi.NewHandler(service, httpapi.Config{
		AllowedOrigin:     "https://rebvar.xyz",
		ResetToken:        "test-reset-token",
		RateLimit:         1,
		RateWindow:        time.Minute,
		TrustedProxyCIDRs: []string{"10.0.0.0/8"},
	})

	request := func(forwardedFor string) int {
		req := httptest.NewRequest(http.MethodGet, "/api/orders", nil)
		req.RemoteAddr = "10.2.0.5:4123"
		req.Header.Set("X-Forwarded-For", forwardedFor)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		return res.Code
	}

	if got := request("203.0.113.50, 198.51.100.10"); got != http.StatusOK {
		t.Fatalf("first request expected 200, got %d", got)
	}
	if got := request("203.0.113.99, 198.51.100.10"); got != http.StatusTooManyRequests {
		t.Fatalf("spoofed leftmost address must not create a new budget, got %d", got)
	}
}

func TestEventStreamSurvivesServerWriteTimeout(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	handler := httpapi.NewHandler(service, httpapi.Config{
		AllowedOrigin:  "https://rebvar.xyz",
		ResetToken:     "test-reset-token",
		RateLimit:      100,
		RateWindow:     time.Minute,
		EventHeartbeat: 5 * time.Millisecond,
	})
	server := httptest.NewUnstartedServer(handler)
	server.Config.WriteTimeout = 20 * time.Millisecond
	server.Start()
	defer server.Close()

	response, err := server.Client().Get(server.URL + "/api/events")
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	reader := bufio.NewReader(response.Body)

	time.Sleep(35 * time.Millisecond)
	created, err := server.Client().Post(server.URL+"/api/orders", "application/json", strings.NewReader(`{"item":"Late soup","quantity":1}`))
	if err != nil {
		t.Fatal(err)
	}
	created.Body.Close()

	found := make(chan bool, 1)
	go func() {
		for {
			line, readErr := reader.ReadString('\n')
			if readErr != nil {
				found <- false
				return
			}
			if strings.TrimSpace(line) == "event: orders-changed" {
				found <- true
				return
			}
		}
	}()
	select {
	case received := <-found:
		if !received {
			t.Fatal("stream closed before delayed update")
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for delayed SSE update")
	}
}

func TestCreateAndUpdateOrderResponses(t *testing.T) {
	handler := newTestHandler(t, 100)
	create := httptest.NewRequest(http.MethodPost, "/api/orders", strings.NewReader(`{"item":"Miso noodles","quantity":2}`))
	create.Header.Set("Content-Type", "application/json")
	created := httptest.NewRecorder()
	handler.ServeHTTP(created, create)
	if created.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", created.Code, created.Body.String())
	}

	var order orders.Order
	if err := json.NewDecoder(created.Body).Decode(&order); err != nil {
		t.Fatal(err)
	}
	if order.Status != orders.StatusNew || order.Item != "Miso noodles" {
		t.Fatalf("unexpected order: %#v", order)
	}

	update := httptest.NewRequest(http.MethodPatch, "/api/orders/1/status", strings.NewReader(`{"status":"preparing"}`))
	update.Header.Set("Content-Type", "application/json")
	updated := httptest.NewRecorder()
	handler.ServeHTTP(updated, update)
	if updated.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", updated.Code, updated.Body.String())
	}
}

func TestMalformedOversizedAndUnknownJSONAreRejected(t *testing.T) {
	handler := newTestHandler(t, 100)
	tests := []struct {
		name string
		body []byte
		want int
	}{
		{name: "malformed", body: []byte(`{"item":`), want: http.StatusBadRequest},
		{name: "unknown field", body: []byte(`{"item":"Soup","quantity":1,"customer":"private"}`), want: http.StatusBadRequest},
		{name: "oversized", body: append(append([]byte(`{"item":"`), bytes.Repeat([]byte("x"), 5000)...), []byte(`","quantity":1}`)...), want: http.StatusRequestEntityTooLarge},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/orders", bytes.NewReader(test.body))
			req.Header.Set("Content-Type", "application/json")
			res := httptest.NewRecorder()
			handler.ServeHTTP(res, req)
			if res.Code != test.want {
				t.Fatalf("expected %d, got %d: %s", test.want, res.Code, res.Body.String())
			}
		})
	}
}

func TestResetRequiresConfiguredToken(t *testing.T) {
	handler := newTestHandler(t, 100)
	unauthorized := httptest.NewRecorder()
	handler.ServeHTTP(unauthorized, httptest.NewRequest(http.MethodPost, "/api/demo/reset", nil))
	if unauthorized.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", unauthorized.Code)
	}

	authorizedRequest := httptest.NewRequest(http.MethodPost, "/api/demo/reset", nil)
	authorizedRequest.Header.Set("X-Demo-Reset-Token", "test-reset-token")
	authorized := httptest.NewRecorder()
	handler.ServeHTTP(authorized, authorizedRequest)
	if authorized.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", authorized.Code, authorized.Body.String())
	}
}

func TestCORSAllowsOnlyConfiguredOrigin(t *testing.T) {
	handler := newTestHandler(t, 100)

	allowedRequest := httptest.NewRequest(http.MethodGet, "/api/orders", nil)
	allowedRequest.Header.Set("Origin", "https://rebvar.xyz")
	allowed := httptest.NewRecorder()
	handler.ServeHTTP(allowed, allowedRequest)
	if got := allowed.Header().Get("Access-Control-Allow-Origin"); got != "https://rebvar.xyz" {
		t.Fatalf("expected configured origin, got %q", got)
	}

	blockedRequest := httptest.NewRequest(http.MethodGet, "/api/orders", nil)
	blockedRequest.Header.Set("Origin", "https://example.invalid")
	blocked := httptest.NewRecorder()
	handler.ServeHTTP(blocked, blockedRequest)
	if got := blocked.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("expected no CORS header, got %q", got)
	}
}

func TestRateLimitReturns429AfterBudgetIsUsed(t *testing.T) {
	handler := newTestHandler(t, 2)

	for index, want := range []int{http.StatusOK, http.StatusOK, http.StatusTooManyRequests} {
		request := httptest.NewRequest(http.MethodGet, "/api/orders", nil)
		request.RemoteAddr = "203.0.113.8:4123"
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != want {
			t.Fatalf("request %d: expected %d, got %d", index+1, want, response.Code)
		}
	}
}
