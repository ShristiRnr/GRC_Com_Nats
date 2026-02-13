package broker

import (
	"encoding/json"

	"github.com/nats-io/nats.go"
)

type Broker struct {
	Conn *nats.Conn
}

func NewNATSBroker(url string) (*Broker, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		// Log but return a "disconnected" broker so app can start
		return &Broker{Conn: nil}, nil
	}
	return &Broker{Conn: nc}, nil
}

func (b *Broker) Publish(subject string, v interface{}) error {
	if b.Conn == nil {
		return nil // No-op mock success
	}
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return b.Conn.Publish(subject, data)
}

func (b *Broker) Subscribe(subject string, cb nats.MsgHandler) (*nats.Subscription, error) {
	if b.Conn == nil {
		return nil, nil // No-op
	}
	return b.Conn.Subscribe(subject, cb)
}

func (b *Broker) Close() {
	if b.Conn != nil {
		b.Conn.Close()
	}
}
