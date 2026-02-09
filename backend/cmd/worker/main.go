package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	"grc-compil/backend/internal/worker/processor"
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

	p := processor.NewProcessor(connPool, natsBroker)
	p.Start()

	log.Println("Worker started and listening for events...")

	// Wait for termination signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Worker shutting down...")
}
