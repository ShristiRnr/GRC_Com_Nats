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
		return nil, err
	}
	return &Broker{Conn: nc}, nil
}

func (b *Broker) Publish(subject string, v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return b.Conn.Publish(subject, data)
}

func (b *Broker) Subscribe(subject string, cb nats.MsgHandler) (*nats.Subscription, error) {
	return b.Conn.Subscribe(subject, cb)
}

func (b *Broker) Close() {
	b.Conn.Close()
}
