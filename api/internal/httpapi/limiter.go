package httpapi

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type visitor struct {
	count       int
	windowStart time.Time
}

type fixedWindowLimiter struct {
	mu             sync.Mutex
	limit          int
	window         time.Duration
	now            func() time.Time
	visitors       map[string]visitor
	trustedProxies []*net.IPNet
}

func newFixedWindowLimiter(limit int, window time.Duration, trustedProxyCIDRs []string) *fixedWindowLimiter {
	trustedProxies := make([]*net.IPNet, 0, len(trustedProxyCIDRs))
	for _, value := range trustedProxyCIDRs {
		_, network, err := net.ParseCIDR(strings.TrimSpace(value))
		if err == nil {
			trustedProxies = append(trustedProxies, network)
		}
	}
	return &fixedWindowLimiter{limit: limit, window: window, now: time.Now, visitors: make(map[string]visitor), trustedProxies: trustedProxies}
}

func (limiter *fixedWindowLimiter) clientKey(request *http.Request) string {
	host, _, err := net.SplitHostPort(request.RemoteAddr)
	if err != nil {
		host = request.RemoteAddr
	}
	remoteIP := net.ParseIP(host)
	for _, network := range limiter.trustedProxies {
		if remoteIP != nil && network.Contains(remoteIP) {
			forwarded := strings.Split(request.Header.Get("X-Forwarded-For"), ",")
			leftmostValid := ""
			for index := len(forwarded) - 1; index >= 0; index-- {
				candidate := strings.TrimSpace(forwarded[index])
				candidateIP := net.ParseIP(candidate)
				if candidateIP == nil {
					continue
				}
				leftmostValid = candidate
				if !limiter.isTrustedProxy(candidateIP) {
					return candidate
				}
			}
			if leftmostValid != "" {
				return leftmostValid
			}
			break
		}
	}
	return host
}

func (limiter *fixedWindowLimiter) isTrustedProxy(ip net.IP) bool {
	for _, network := range limiter.trustedProxies {
		if network.Contains(ip) {
			return true
		}
	}
	return false
}

func (limiter *fixedWindowLimiter) allow(request *http.Request) bool {
	key := limiter.clientKey(request)
	now := limiter.now()
	limiter.mu.Lock()
	defer limiter.mu.Unlock()
	current := limiter.visitors[key]
	if current.windowStart.IsZero() || now.Sub(current.windowStart) >= limiter.window {
		limiter.visitors[key] = visitor{count: 1, windowStart: now}
		return true
	}
	if current.count >= limiter.limit {
		return false
	}
	current.count++
	limiter.visitors[key] = current
	return true
}

func (limiter *fixedWindowLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != http.MethodOptions && !limiter.allow(request) {
			writer.Header().Set("Retry-After", "60")
			writeError(writer, http.StatusTooManyRequests, "rate_limit", "Too many requests. Try again shortly.")
			return
		}
		next.ServeHTTP(writer, request)
	})
}
