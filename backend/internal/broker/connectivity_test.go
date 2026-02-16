package broker

import (
	"testing"
	"github.com/stretchr/testify/require"
	"grc-compil/backend/internal/broker"
)

func TestNATSConnectivity(t *testing.T) {
	// Try to connect to NATS at localhost:4222 (mapped from Docker)
	b, err := broker.NewNATSBroker("nats://localhost:4222")
	require.NoError(t, err)
	require.NotNil(t, b.Conn, "NATS connection should be established")
	require.NotNil(t, b.JS, "JetStream context should be available")

	// Try to initialize streams
	err = b.InitStreams()
	require.NoError(t, err, "Stream initialization should succeed")
}
