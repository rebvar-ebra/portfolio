package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rebvar/rebvar-studio/api/internal/httpapi"
	"github.com/rebvar/rebvar-studio/api/internal/orders"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	databaseURL := requiredEnvironment("DATABASE_URL")
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		logger.Error("database configuration failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	if err := pool.Ping(context.Background()); err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}

	rateLimit, err := strconv.Atoi(environment("RATE_LIMIT", "60"))
	if err != nil || rateLimit < 1 {
		logger.Error("RATE_LIMIT must be a positive integer")
		os.Exit(1)
	}

	repository := orders.NewPostgresRepository(pool)
	service := orders.NewService(repository)
	api := httpapi.NewHandler(service, httpapi.Config{
		AllowedOrigin:     environment("ALLOWED_ORIGIN", "http://localhost:3000"),
		ResetToken:        requiredEnvironment("DEMO_RESET_TOKEN"),
		RateLimit:         rateLimit,
		RateWindow:        time.Minute,
		TrustedProxyCIDRs: splitList(os.Getenv("TRUSTED_PROXY_CIDRS")),
	})

	server := &http.Server{
		Addr:              ":" + environment("PORT", "8080"),
		Handler:           api,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	shutdownSignal, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	go func() {
		logger.Info("api listening", "address", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("api stopped unexpectedly", "error", err)
			os.Exit(1)
		}
	}()

	<-shutdownSignal.Done()
	shutdownContext, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownContext); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
}

func requiredEnvironment(key string) string {
	value := os.Getenv(key)
	if value == "" {
		slog.Error("required environment variable is missing", "key", key)
		os.Exit(1)
	}
	return value
}

func environment(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func splitList(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
