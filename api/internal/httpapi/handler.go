package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/rebvar/rebvar-studio/api/internal/orders"
)

const maxRequestBody = 4096

type Config struct {
	AllowedOrigin string
	ResetToken    string
	RateLimit     int
	RateWindow    time.Duration
}

type handler struct {
	service *orders.Service
	config  Config
	events  *eventHub
}

func NewHandler(service *orders.Service, config Config) http.Handler {
	if config.RateLimit <= 0 {
		config.RateLimit = 60
	}
	if config.RateWindow <= 0 {
		config.RateWindow = time.Minute
	}

	api := &handler{service: service, config: config, events: newEventHub()}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", api.health)
	mux.HandleFunc("GET /api/orders", api.listOrders)
	mux.HandleFunc("POST /api/orders", api.createOrder)
	mux.HandleFunc("PATCH /api/orders/{id}/status", api.updateStatus)
	mux.HandleFunc("GET /api/stats", api.stats)
	mux.HandleFunc("GET /api/events", api.eventStream)
	mux.HandleFunc("POST /api/demo/reset", api.reset)

	limited := newFixedWindowLimiter(config.RateLimit, config.RateWindow).middleware(mux)
	return api.withCORS(limited)
}

func (api *handler) health(writer http.ResponseWriter, _ *http.Request) {
	writeJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
}

func (api *handler) listOrders(writer http.ResponseWriter, request *http.Request) {
	result, err := api.service.List(request.Context(), request.URL.Query().Get("status"))
	if err != nil {
		if errors.Is(err, orders.ErrInvalidStatus) {
			writeError(writer, http.StatusBadRequest, "invalid_status", "Filter status must be new, preparing, or ready.")
			return
		}
		writeError(writer, http.StatusInternalServerError, "server_error", "Orders could not be loaded.")
		return
	}
	writeJSON(writer, http.StatusOK, result)
}

func (api *handler) createOrder(writer http.ResponseWriter, request *http.Request) {
	var input orders.CreateInput
	if err := decodeJSON(writer, request, &input); err != nil {
		writeDecodeError(writer, err)
		return
	}
	order, err := api.service.Create(request.Context(), input)
	if err != nil {
		if errors.Is(err, orders.ErrInvalidInput) {
			writeError(writer, http.StatusUnprocessableEntity, "invalid_order", "Item must be 2–80 characters and quantity must be 1–20.")
			return
		}
		writeError(writer, http.StatusInternalServerError, "server_error", "The order could not be created.")
		return
	}
	api.events.publish()
	writeJSON(writer, http.StatusCreated, order)
}

func (api *handler) updateStatus(writer http.ResponseWriter, request *http.Request) {
	id, err := strconv.ParseInt(request.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(writer, http.StatusBadRequest, "invalid_id", "Order ID must be a positive number.")
		return
	}
	var input struct {
		Status string `json:"status"`
	}
	if err := decodeJSON(writer, request, &input); err != nil {
		writeDecodeError(writer, err)
		return
	}
	status, err := orders.ParseStatus(input.Status)
	if err != nil {
		writeError(writer, http.StatusBadRequest, "invalid_status", "Status must be new, preparing, or ready.")
		return
	}
	order, err := api.service.UpdateStatus(request.Context(), id, status)
	switch {
	case errors.Is(err, orders.ErrNotFound):
		writeError(writer, http.StatusNotFound, "not_found", "Order not found.")
		return
	case errors.Is(err, orders.ErrInvalidTransition):
		writeError(writer, http.StatusConflict, "invalid_transition", "Orders move from new to preparing, then to ready.")
		return
	case err != nil:
		writeError(writer, http.StatusInternalServerError, "server_error", "The order status could not be changed.")
		return
	}
	api.events.publish()
	writeJSON(writer, http.StatusOK, order)
}

func (api *handler) stats(writer http.ResponseWriter, request *http.Request) {
	stats, err := api.service.Stats(request.Context())
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "server_error", "Statistics could not be loaded.")
		return
	}
	writeJSON(writer, http.StatusOK, stats)
}

func (api *handler) reset(writer http.ResponseWriter, request *http.Request) {
	if api.config.ResetToken == "" || request.Header.Get("X-Demo-Reset-Token") != api.config.ResetToken {
		writeError(writer, http.StatusUnauthorized, "unauthorized", "A valid demo reset token is required.")
		return
	}
	if err := api.service.Reset(request.Context()); err != nil {
		writeError(writer, http.StatusInternalServerError, "server_error", "Demo data could not be reset.")
		return
	}
	api.events.publish()
	writer.WriteHeader(http.StatusNoContent)
}

func (api *handler) eventStream(writer http.ResponseWriter, request *http.Request) {
	flusher, ok := writer.(http.Flusher)
	if !ok {
		writeError(writer, http.StatusInternalServerError, "stream_unavailable", "Live updates are unavailable.")
		return
	}
	writer.Header().Set("Content-Type", "text/event-stream")
	writer.Header().Set("Cache-Control", "no-cache")
	writer.Header().Set("Connection", "keep-alive")
	events, unsubscribe := api.events.subscribe()
	defer unsubscribe()
	_, _ = fmt.Fprint(writer, "event: connected\ndata: {}\n\n")
	flusher.Flush()

	for {
		select {
		case <-request.Context().Done():
			return
		case _, open := <-events:
			if !open {
				return
			}
			_, _ = fmt.Fprint(writer, "event: orders-changed\ndata: {}\n\n")
			flusher.Flush()
		}
	}
}

func (api *handler) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		origin := request.Header.Get("Origin")
		if origin != "" && origin == api.config.AllowedOrigin {
			writer.Header().Set("Access-Control-Allow-Origin", origin)
			writer.Header().Set("Vary", "Origin")
			writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Demo-Reset-Token")
			writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		}
		if request.Method == http.MethodOptions {
			if origin != api.config.AllowedOrigin {
				writeError(writer, http.StatusForbidden, "origin_forbidden", "This origin is not allowed.")
				return
			}
			writer.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(writer, request)
	})
}

func decodeJSON(writer http.ResponseWriter, request *http.Request, destination any) error {
	request.Body = http.MaxBytesReader(writer, request.Body, maxRequestBody)
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("request body must contain one JSON object")
	}
	return nil
}

func writeDecodeError(writer http.ResponseWriter, err error) {
	var maxBytesError *http.MaxBytesError
	if errors.As(err, &maxBytesError) || strings.Contains(err.Error(), "request body too large") {
		writeError(writer, http.StatusRequestEntityTooLarge, "body_too_large", "Request body must be smaller than 4 KB.")
		return
	}
	writeError(writer, http.StatusBadRequest, "invalid_json", "Request body must be one valid JSON object with known fields.")
}

func writeError(writer http.ResponseWriter, status int, code, message string) {
	writeJSON(writer, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(value)
}
