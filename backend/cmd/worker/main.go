package main

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/email"
	"grc-compil/backend/internal/service/notification"
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

	emailService := email.NewEmailService(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUsername,
		cfg.SMTPPassword,
		cfg.SMTPFromEmail,
		cfg.SMTPFromName,
		cfg.FrontendURL,
	)

	store := db.NewStore(connPool)
	notificationService := notification.NewNotificationService(store)

	p := processor.NewProcessor(connPool, natsBroker, emailService, notificationService)
	p.Start()
}
