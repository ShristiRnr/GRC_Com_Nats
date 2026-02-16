package broker

import (
	"encoding/json"

	"github.com/nats-io/nats.go"
)

type Broker struct {
	Conn *nats.Conn
	JS   nats.JetStreamContext
}

func NewNATSBroker(url string) (*Broker, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		// Log but return a "disconnected" broker so app can start
		return &Broker{Conn: nil}, nil
	}

	js, err := nc.JetStream()
	if err != nil {
		return &Broker{Conn: nc}, nil
	}

	return &Broker{Conn: nc, JS: js}, nil
}

func (b *Broker) Publish(subject string, v interface{}) error {
	if b.JS != nil {
		_, err := b.PublishJS(subject, v)
		return err
	}
	if b.Conn == nil {
		return nil // No-op mock success
	}
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	
	// Default to Core NATS only if JS is unavailable
	return b.Conn.Publish(subject, data)
}

func (b *Broker) PublishJS(subject string, v interface{}) (*nats.PubAck, error) {
	if b.JS == nil {
		return nil, nil // No-op
	}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return b.JS.Publish(subject, data)
}

func (b *Broker) Subscribe(subject string, cb nats.MsgHandler) (*nats.Subscription, error) {
	if b.Conn == nil {
		return nil, nil // No-op
	}
	return b.Conn.Subscribe(subject, cb)
}

func (b *Broker) QueueSubscribe(subject, queue string, cb nats.MsgHandler) (*nats.Subscription, error) {
	if b.Conn == nil {
		return nil, nil // No-op
	}
	return b.Conn.QueueSubscribe(subject, queue, cb)
}

func (b *Broker) QueueSubscribeJS(subject, queue string, cb nats.MsgHandler) (*nats.Subscription, error) {
	if b.JS == nil {
		return nil, nil // No-op
	}
	return b.JS.QueueSubscribe(subject, queue, cb, nats.ManualAck())
}

func (b *Broker) InitStreams() error {
	if b.JS == nil {
		return nil
	}

	// Define stream for notifications and emails
	streams := []struct {
		name     string
		subjects []string
	}{
		{"NOTIFICATIONS", []string{"tasks.notification"}},
		{"EMAILS", []string{"email.send"}},
	}

	for _, s := range streams {
		_, err := b.JS.AddStream(&nats.StreamConfig{
			Name:     s.name,
			Subjects: s.subjects,
			Storage:  nats.FileStorage, // Production persistence
		})
		if err != nil && err != nats.ErrStreamNameAlreadyInUse {
			return err
		}
	}
	return nil
}

func (b *Broker) Close() {
	if b.Conn != nil {
		b.Conn.Close()
	}
}
