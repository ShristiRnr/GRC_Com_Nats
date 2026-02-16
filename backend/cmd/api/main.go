package main

import (
	"context"
	"log"
	"net/http"

	"grc-compil/backend/internal/api/router"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/maintenance"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	var store db.Querier

	// Connect to DB
	connPool, err := pgxpool.New(context.Background(), cfg.DBURL)
	if err != nil {
		log.Fatalf("Cannot create DB pool: %v", err)
	}

	if err := connPool.Ping(context.Background()); err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}

	log.Println("Connected to Database successfully")
	store = db.NewStore(connPool)
	defer connPool.Close()

	natsBroker, err := broker.NewNATSBroker(cfg.NATSURL)
	if err != nil {
		log.Fatalf("Fatal: cannot connect to NATS JetStream: %v", err)
	}
	defer natsBroker.Close()

	r, err := router.SetupRouter(store, natsBroker, cfg)
	if err != nil {
		log.Fatalf("Fatal: failed to setup router: %v", err)
	}

	// Start background maintenance service
	maintenanceSvc := maintenance.NewMaintenanceService(store, cfg.AuditLogRetentionDays)
	go maintenanceSvc.Start(context.Background())

	log.Printf("Starting API server on %s", cfg.ServerAddr)
	if err := http.ListenAndServe(cfg.ServerAddr, r); err != nil {
		log.Fatalf("cannot start server: %v", err)
	}
}
