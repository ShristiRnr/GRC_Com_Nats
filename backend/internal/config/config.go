package config

import (
	"time"
	"github.com/spf13/viper"
)

type Config struct {
	DBURL                string        `mapstructure:"DB_URL"`
	ServerAddr           string        `mapstructure:"SERVER_ADDR"`
	NATSURL              string        `mapstructure:"NATS_URL"`
	TokenSecret          string        `mapstructure:"TOKEN_SECRET"`
	TokenDuration        time.Duration `mapstructure:"TOKEN_DURATION"`
	RefreshTokenDuration time.Duration `mapstructure:"REFRESH_TOKEN_DURATION"`
	
	// Auth cache configuration
	AuthCacheTTL         time.Duration `mapstructure:"AUTH_CACHE_TTL"`
	AuthCacheMaxSize     int           `mapstructure:"AUTH_CACHE_MAX_SIZE"`
	// Security configuration
	JWTSigningAlgorithm  string        `mapstructure:"JWT_SIGNING_ALGORITHM"`
	JWTIssuer            string        `mapstructure:"JWT_ISSUER"`
	JWTAudience          string        `mapstructure:"JWT_AUDIENCE"`
	SuperAdminRole       string        `mapstructure:"SUPER_ADMIN_ROLE"`
	UserRole             string        `mapstructure:"USER_ROLE"`
	VerificationDuration time.Duration `mapstructure:"VERIFICATION_DURATION"`
	AllowOrigins         []string      `mapstructure:"ALLOW_ORIGINS"`
	BcryptCost           int           `mapstructure:"BCRYPT_COST"`
	RateLimitLogin       int           `mapstructure:"RATE_LIMIT_LOGIN"`
	RateLimitRefresh     int           `mapstructure:"RATE_LIMIT_REFRESH"`
	RateLimitSignup      int           `mapstructure:"RATE_LIMIT_SIGNUP"`
	RateLimitMaxSize     int           `mapstructure:"RATE_LIMIT_MAX_SIZE"`
	MaxSessionsPerUser   int           `mapstructure:"MAX_SESSIONS_PER_USER"`
	AuditLogRetentionDays int           `mapstructure:"AUDIT_LOG_RETENTION_DAYS"`
	
	// Cookie configuration
	CookieSameSite       string        `mapstructure:"COOKIE_SAME_SITE"`
	CookieSecure         bool          `mapstructure:"COOKIE_SECURE"`
	
	// Email configuration
	SMTPHost             string        `mapstructure:"SMTP_HOST"`
	SMTPPort             int           `mapstructure:"SMTP_PORT"`
	SMTPUsername         string        `mapstructure:"SMTP_USERNAME"`
	SMTPPassword         string        `mapstructure:"SMTP_PASSWORD"`
	SMTPFromEmail        string        `mapstructure:"SMTP_FROM_EMAIL"`
	SMTPFromName         string        `mapstructure:"SMTP_FROM_NAME"`
	
	// Frontend URL for email verification links
	FrontendURL          string        `mapstructure:"FRONTEND_URL"`

	// Security Constants (Centralized to avoid hardcoding)
	AuthPayloadKey      string        `mapstructure:"AUTH_PAYLOAD_KEY"`
	AccessTokenCookie   string        `mapstructure:"ACCESS_TOKEN_COOKIE"`
	RefreshTokenCookie  string        `mapstructure:"REFRESH_TOKEN_COOKIE"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
