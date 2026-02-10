package processor

import (
	"encoding/json"
	"log"

	"github.com/nats-io/nats.go"
	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/broker"
	"grc-compil/backend/internal/service/email"
)

type Processor struct {
	db           *pgxpool.Pool
	broker       *broker.Broker
	emailService email.EmailService
}

func NewProcessor(db *pgxpool.Pool, b *broker.Broker, e email.EmailService) *Processor {
	return &Processor{db: db, broker: b, emailService: e}
}

func (p *Processor) Start() {
	_, err := p.broker.Subscribe("tasks.*", func(msg *nats.Msg) {
		log.Printf("Received message on subject: %s", msg.Subject)
		p.HandleTask(msg)
	})
	if err != nil {
		log.Fatalf("failed to subscribe to NATS tasks: %v", err)
	}

	_, err = p.broker.Subscribe("email.send", func(msg *nats.Msg) {
		log.Printf("Received message on subject: %s", msg.Subject)
		p.HandleEmail(msg)
	})
	if err != nil {
		log.Fatalf("failed to subscribe to NATS email: %v", err)
	}
}

func (p *Processor) HandleEmail(msg *nats.Msg) {
	var payload struct {
		Type     string `json:"type"`
		To       string `json:"to"`
		Username string `json:"username"`
		Token    string `json:"token,omitempty"`
	}

	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		log.Printf("failed to unmarshal email payload: %v", err)
		return
	}

	var err error
	switch payload.Type {
	case "verification":
		err = p.emailService.SendVerificationEmail(payload.To, payload.Username, payload.Token)
	case "welcome":
		err = p.emailService.SendWelcomeEmail(payload.To, payload.Username)
	default:
		log.Printf("unknown email type: %s", payload.Type)
		return
	}

	if err != nil {
		log.Printf("failed to send %s email to %s: %v", payload.Type, payload.To, err)
		// Option: NATS retry logic here
	} else {
		log.Printf("successfully sent %s email to %s", payload.Type, payload.To)
	}
}

func (p *Processor) HandleTask(msg *nats.Msg) {
	var payload map[string]interface{}
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		log.Printf("failed to unmarshal task payload: %v", err)
		return
	}

	log.Printf("Processing task on subject %s with payload: %v", msg.Subject, payload)
}
