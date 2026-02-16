package broker

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// Broker wraps NATS JetStream connection
type Broker struct {
	Conn *nats.Conn
	JS   nats.JetStreamContext
}

// NewNATSBroker creates a new NATS JetStream broker with proper error handling
func NewNATSBroker(url string) (*Broker, error) {
	// Connect to NATS with production-ready options
	nc, err := nats.Connect(
		url,
		nats.MaxReconnects(10),
		nats.ReconnectWait(2*time.Second),
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			if err != nil {
				log.Printf("ERROR: NATS disconnected: %v", err)
			}
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Printf("INFO: NATS reconnected to %s", nc.ConnectedUrl())
		}),
		nats.ClosedHandler(func(nc *nats.Conn) {
			log.Printf("WARNING: NATS connection closed")
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS at %s: %w", url, err)
	}

	// Initialize JetStream context
	js, err := nc.JetStream()
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("failed to initialize JetStream (ensure NATS server is running with -js flag): %w", err)
	}

	log.Printf("INFO: Successfully connected to NATS JetStream at %s", url)
	return &Broker{Conn: nc, JS: js}, nil
}

// Publish sends a message to a JetStream stream
func (b *Broker) Publish(subject string, v interface{}) error {
	if !b.IsHealthy() {
		return fmt.Errorf("NATS JetStream is not available")
	}

	ack, err := b.PublishJS(subject, v)
	if err != nil {
		log.Printf("ERROR: Failed to publish to %s: %v", subject, err)
		return err
	}

	log.Printf("DEBUG: Message published to %s (stream: %s, seq: %d)", subject, ack.Stream, ack.Sequence)
	return nil
}

// PublishJS publishes to JetStream with acknowledgment
func (b *Broker) PublishJS(subject string, v interface{}) (*nats.PubAck, error) {
	if b.JS == nil {
		return nil, fmt.Errorf("JetStream context not initialized")
	}

	// Marshal to JSON for proper data serialization
	data, err := json.Marshal(v)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal message: %w", err)
	}

	ack, err := b.JS.Publish(subject, data)
	if err != nil {
		return nil, fmt.Errorf("JetStream publish failed: %w", err)
	}

	return ack, nil
}

// QueueSubscribeJS creates a JetStream queue subscription with manual acknowledgment
func (b *Broker) QueueSubscribeJS(subject, queue string, cb nats.MsgHandler) (*nats.Subscription, error) {
	if b.JS == nil {
		return nil, fmt.Errorf("JetStream context not initialized")
	}

	sub, err := b.JS.QueueSubscribe(subject, queue, cb, nats.ManualAck())
	if err != nil {
		return nil, fmt.Errorf("failed to create queue subscription for %s: %w", subject, err)
	}

	log.Printf("INFO: Subscribed to %s with queue group %s", subject, queue)
	return sub, nil
}

// InitStreams initializes JetStream streams with production-ready configuration
func (b *Broker) InitStreams() error {
	if b.JS == nil {
		return fmt.Errorf("JetStream context not initialized")
	}

	streams := []struct {
		name     string
		subjects []string
	}{
		{"EMAILS", []string{"email.send"}},
		{"NOTIFICATIONS", []string{"tasks.notification"}},
	}

	for _, s := range streams {
		streamInfo, err := b.JS.AddStream(&nats.StreamConfig{
			Name:       s.name,
			Subjects:   s.subjects,
			Storage:    nats.FileStorage,
			Retention:  nats.WorkQueuePolicy, // Auto-delete after ack
			MaxMsgs:    100000,                // Limit total messages
			MaxAge:     7 * 24 * time.Hour,    // Delete messages older than 7 days
			Discard:    nats.DiscardOld,       // Delete oldest when limit reached
			Duplicates: 2 * time.Minute,       // Prevent duplicate publishes
		})

		if err != nil {
			// Stream already exists - this is fine
			if err == nats.ErrStreamNameAlreadyInUse {
				log.Printf("INFO: Stream %s already exists, skipping creation", s.name)
				continue
			}
			return fmt.Errorf("failed to create stream %s: %w", s.name, err)
		}

		log.Printf("INFO: Created stream %s (subjects: %v, messages: %d)", 
			streamInfo.Config.Name, streamInfo.Config.Subjects, streamInfo.State.Msgs)
	}

	return nil
}

// IsHealthy checks if the NATS connection is healthy
func (b *Broker) IsHealthy() bool {
	if b == nil || b.Conn == nil || b.JS == nil {
		return false
	}
	return b.Conn.IsConnected()
}

// Close closes the NATS connection gracefully
func (b *Broker) Close() {
	if b.Conn != nil {
		log.Printf("INFO: Closing NATS connection")
		b.Conn.Close()
	}
}
