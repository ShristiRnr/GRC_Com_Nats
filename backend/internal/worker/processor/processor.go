package processor

import (
	"encoding/json"
	"log"

	"github.com/nats-io/nats.go"
	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
)

type Processor struct {
	db     *pgxpool.Pool
	broker *broker.Broker
}

func NewProcessor(db *pgxpool.Pool, b *broker.Broker) *Processor {
	return &Processor{db: db, broker: b}
}

func (p *Processor) Start() {
	_, err := p.broker.Subscribe("tasks.*", func(msg *nats.Msg) {
		log.Printf("Received message on subject: %s", msg.Subject)
		p.HandleTask(msg)
	})
	if err != nil {
		log.Fatalf("failed to subscribe to NATS: %v", err)
	}
}

func (p *Processor) HandleTask(msg *nats.Msg) {
	var payload map[string]interface{}
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		log.Printf("failed to unmarshal payload: %v", err)
		return
	}

	// Route based on subject/type
	log.Printf("Processing task with payload: %v", payload)
	// Example: handler.ProcessReport(p.db, payload)
}
 Lands to process NATS messages.
