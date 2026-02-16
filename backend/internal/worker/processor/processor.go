package processor

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/google/uuid"
	"github.com/go-playground/validator/v10"
	"grc-compil/backend/internal/broker"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/service/email"
	"grc-compil/backend/internal/service/notification"
)

type Processor struct {
	db                  *pgxpool.Pool
	broker              *broker.Broker
	emailService        email.EmailService
	notificationService notification.NotificationService
	validator           *validator.Validate
}

func NewProcessor(db *pgxpool.Pool, b *broker.Broker, e email.EmailService, n notification.NotificationService) *Processor {
	return &Processor{
		db:                  db, 
		broker:              b, 
		emailService:        e, 
		notificationService: n,
		validator:           validator.New(),
	}
}

type EmailPayload struct {
	Type     string `json:"type" validate:"required,oneof=verification welcome"`
	To       string `json:"to" validate:"required,email"`
	Username string `json:"username" validate:"required"`
	Token    string `json:"token,omitempty"`
}

type NotificationPayload struct {
	UserID  int64  `json:"user_id" validate:"required"`
	Email   string `json:"email" validate:"omitempty,email"`
	OrgID   string `json:"org_id" validate:"required,uuid"`
	Title   string `json:"title" validate:"required,min=3"`
	Message string `json:"message" validate:"required"`
	Type    string `json:"type" validate:"required"`
	Link    string `json:"link,omitempty"`
}

func (p *Processor) Start() {
	// 1. Initialize Streams
	if err := p.broker.InitStreams(); err != nil {
		log.Fatalf("failed to initialize NATS JetStream: %v", err)
	}

	// 2. Subscribe using JetStream Queue Group
	subEmail, err := p.broker.QueueSubscribeJS("email.send", "email_workers", func(msg *nats.Msg) {
		p.HandleEmail(msg)
	})
	if err != nil {
		log.Fatalf("failed to subscribe to JetStream email: %v", err)
	}

	subNotify, err := p.broker.QueueSubscribeJS("tasks.notification", "notification_workers", func(msg *nats.Msg) {
		p.HandleNotification(msg)
	})
	if err != nil {
		log.Fatalf("failed to subscribe to JetStream notifications: %v", err)
	}

	log.Printf("Worker Processor started via JetStream Queue System. Listening for events...")

	// 3. Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down processor...")
	subEmail.Drain()
	subNotify.Drain()
}

func (p *Processor) HandleEmail(msg *nats.Msg) {
	var payload EmailPayload
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		log.Printf("failed to unmarshal email payload: %v", err)
		msg.Term() // Reject permanently
		return
	}

	if err := p.validator.Struct(payload); err != nil {
		log.Printf("invalid email payload: %v", err)
		msg.Term() // Reject permanently
		return
	}

	var err error
	switch payload.Type {
	case "verification":
		err = p.emailService.SendVerificationEmail(payload.To, payload.Username, payload.Token)
	case "welcome":
		err = p.emailService.SendWelcomeEmail(payload.To, payload.Username)
	}

	if err != nil {
		log.Printf("failed to send %s email: %v", payload.Type, err)
		msg.Nak() // Redeliver later
	} else {
		msg.Ack()
		log.Printf("successfully sent %s email to %s", payload.Type, payload.To)
	}
}

func (p *Processor) HandleNotification(msg *nats.Msg) {
	var payload NotificationPayload
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		log.Printf("failed to unmarshal notification payload: %v", err)
		msg.Term()
		return
	}

	if err := p.validator.Struct(payload); err != nil {
		log.Printf("invalid notification payload: %v", err)
		msg.Term()
		return
	}

	orgID, _ := uuid.Parse(payload.OrgID)
	var pgOrgID pgtype.UUID
	copy(pgOrgID.Bytes[:], orgID[:])
	pgOrgID.Valid = true

	// 1. Persist in-app notification
	_, err := p.notificationService.CreateNotification(context.Background(), db.CreateNotificationParams{
		UserID:  payload.UserID,
		OrgID:   pgOrgID,
		Title:   payload.Title,
		Message: payload.Message,
		Type:    payload.Type,
		Link:    pgtype.Text{String: payload.Link, Valid: payload.Link != ""},
	})
	if err != nil {
		log.Printf("failed to persist notification: %v", err)
		msg.Nak()
		return
	}

	// 2. Send email notification (if requested)
	if payload.Email != "" {
		err = p.emailService.SendNotificationEmail(payload.Email, payload.Title, payload.Message)
		if err != nil {
			log.Printf("failed to send email notification: %v", err)
			msg.Nak()
			return
		}
	}

	msg.Ack()
}

func (p *Processor) HandleTask(msg *nats.Msg) {
	// Core NATS handler (leaving as is or migrate if needed)
	var payload map[string]interface{}
	if err := json.Unmarshal(msg.Data, &payload); err != nil {
		return
	}
	log.Printf("Received Core NATS task: %v", payload)
}
