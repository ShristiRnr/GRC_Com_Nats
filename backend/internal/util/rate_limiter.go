package util

import (
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// IPRateLimiter manages rate limiters per IP address
type IPRateLimiter struct {
	ips     map[string]*rate.Limiter
	mu      *sync.RWMutex
	r       rate.Limit
	b       int
	maxSize int
}

// NewIPRateLimiter creates a new IP rate limiter
func NewIPRateLimiter(r rate.Limit, b int, maxSize int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips:     make(map[string]*rate.Limiter),
		mu:      &sync.RWMutex{},
		r:       r,
		b:       b,
		maxSize: maxSize,
	}

	return i
}

// AddIP creates a new rate limiter and adds it to the ips map
func (i *IPRateLimiter) AddIP(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	// SECURITY: Memory Exhaustion Protection
	// If map grows too large (e.g. from a botnet spray), clear it.
	// In a more complex system, we'd use an LRU cache or Redis.
	if len(i.ips) >= i.maxSize {
		i.ips = make(map[string]*rate.Limiter)
	}

	limiter := rate.NewLimiter(i.r, i.b)
	i.ips[ip] = limiter

	return limiter
}

// GetLimiter returns the rate limiter for the provided IP address if it exists.
// Otherwise calls AddIP to add IP address to the map
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.RLock()
	limiter, exists := i.ips[ip]
	i.mu.RUnlock()

	if !exists {
		return i.AddIP(ip)
	}

	return limiter
}

// Cleanup periodically removes old limiters to prevent memory leak
func (i *IPRateLimiter) Cleanup(interval time.Duration) {
	for {
		time.Sleep(interval)
		i.mu.Lock()
		// Periodic flush to prevent stale limiters from eating memory
		i.ips = make(map[string]*rate.Limiter)
		i.mu.Unlock()
	}
}
