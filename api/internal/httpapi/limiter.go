package httpapi

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type visitor struct {
	count       int
	windowStart time.Time
}

type fixedWindowLimiter struct {
	mu       sync.Mutex
	limit    int
	window   time.Duration
	now      func() time.Time
	visitors map[string]visitor
}

func newFixedWindowLimiter(limit int, window time.Duration) *fixedWindowLimiter {
	return &fixedWindowLimiter{limit: limit, window: window, now: time.Now, visitors: make(map[string]visitor)}
}

func (limiter *fixedWindowLimiter) allow(remoteAddress string) bool {
	host, _, err := net.SplitHostPort(remoteAddress)
	if err != nil {
		host = remoteAddress
	}
	now := limiter.now()
	limiter.mu.Lock()
	defer limiter.mu.Unlock()
	current := limiter.visitors[host]
	if current.windowStart.IsZero() || now.Sub(current.windowStart) >= limiter.window {
		limiter.visitors[host] = visitor{count: 1, windowStart: now}
		return true
	}
	if current.count >= limiter.limit {
		return false
	}
	current.count++
	limiter.visitors[host] = current
	return true
}

func (limiter *fixedWindowLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != http.MethodOptions && !limiter.allow(request.RemoteAddr) {
			writer.Header().Set("Retry-After", "60")
			writeError(writer, http.StatusTooManyRequests, "rate_limit", "Too many requests. Try again shortly.")
			return
		}
		next.ServeHTTP(writer, request)
	})
}
