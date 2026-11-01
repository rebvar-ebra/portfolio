package httpapi_test

import (
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
