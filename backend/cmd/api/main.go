package main

import (
	"context"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/api/router"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
)

func main() {
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	connPool, err := pgxpool.New(context.Background(), cfg.DBURL)
	if err != nil {
		log.Fatalf("cannot connect to db: %v", err)
	}
	defer connPool.Close()

	natsBroker, err := broker.NewNATSBroker(cfg.NATSURL)
	if err != nil {
		log.Fatalf("cannot connect to nats: %v", err)
	}
	defer natsBroker.Close()

	r := router.SetupRouter(connPool, natsBroker)

	log.Printf("Starting API server on %s", cfg.ServerAddr)
	if err := http.ListenAndServe(cfg.ServerAddr, r); err != nil {
		log.Fatalf("cannot start server: %v", err)
	}
}
