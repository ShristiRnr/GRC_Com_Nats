package util

import (
	"sync"
	"time"
)

// RoleCache entry stores user role with expiration
type RoleCacheEntry struct {
	Role      string
	CachedAt  time.Time
	ExpiresAt time.Time
}

// AuthCache provides thread-safe caching for user roles
type AuthCache struct {
	cache map[int64]RoleCacheEntry
	mu    sync.RWMutex
	ttl   time.Duration
}

// NewAuthCache creates a new auth cache with the specified TTL
func NewAuthCache(ttl time.Duration) *AuthCache {
	cache := &AuthCache{
		cache: make(map[int64]RoleCacheEntry),
		ttl:   ttl,
	}
	
	// Start background cleanup goroutine
	go cache.cleanup()
	
	return cache
}

// Get retrieves a role from cache if it exists and is not expired
func (ac *AuthCache) Get(userID int64) (string, bool) {
	ac.mu.RLock()
	defer ac.mu.RUnlock()
	
	entry, exists := ac.cache[userID]
	if !exists {
		return "", false
	}
	
	// Check if expired
	if time.Now().After(entry.ExpiresAt) {
		return "", false
	}
	
	return entry.Role, true
}

// Set stores a role in cache with TTL
func (ac *AuthCache) Set(userID int64, role string) {
	ac.mu.Lock()
	defer ac.mu.Unlock()
	
	now := time.Now()
	ac.cache[userID] = RoleCacheEntry{
		Role:      role,
		CachedAt:  now,
		ExpiresAt: now.Add(ac.ttl),
	}
}

// Invalidate removes a user's role from cache (e.g., on role change)
func (ac *AuthCache) Invalidate(userID int64) {
	ac.mu.Lock()
	defer ac.mu.Unlock()
	
	delete(ac.cache, userID)
}

// Clear removes all entries from cache
func (ac *AuthCache) Clear() {
	ac.mu.Lock()
	defer ac.mu.Unlock()
	
	ac.cache = make(map[int64]RoleCacheEntry)
}

// cleanup removes expired entries periodically
func (ac *AuthCache) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		ac.mu.Lock()
		now := time.Now()
		for userID, entry := range ac.cache {
			if now.After(entry.ExpiresAt) {
				delete(ac.cache, userID)
			}
		}
		ac.mu.Unlock()
	}
}

// Stats returns cache statistics for monitoring
type CacheStats struct {
	Size    int
	Hits    int64
	Misses  int64
}

// GetStats returns current cache statistics
func (ac *AuthCache) GetStats() CacheStats {
	ac.mu.RLock()
	defer ac.mu.RUnlock()
	
	return CacheStats{
		Size: len(ac.cache),
	}
}
