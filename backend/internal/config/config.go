package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	DBURL      string `mapstructure:"DB_URL"`
	ServerAddr string `mapstructure:"SERVER_ADDR"`
	NATSURL    string `mapstructure:"NATS_URL"`
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
