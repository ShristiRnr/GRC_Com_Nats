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
	
	// Email configuration
	SMTPHost             string        `mapstructure:"SMTP_HOST"`
	SMTPPort             int           `mapstructure:"SMTP_PORT"`
	SMTPUsername         string        `mapstructure:"SMTP_USERNAME"`
	SMTPPassword         string        `mapstructure:"SMTP_PASSWORD"`
	SMTPFromEmail        string        `mapstructure:"SMTP_FROM_EMAIL"`
	SMTPFromName         string        `mapstructure:"SMTP_FROM_NAME"`
	
	// Frontend URL for email verification links
	FrontendURL          string        `mapstructure:"FRONTEND_URL"`
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
