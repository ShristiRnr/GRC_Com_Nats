# Build Stage
FROM golang:1.24-alpine3.21 AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl gcc musl-dev

# 1. Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# 2. Download migrate tool
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.2/migrate.linux-amd64.tar.gz | tar xvz && mv migrate /app/migrate

# 3. Copy source and build (Strip debug info for smaller binaries)
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o worker ./cmd/worker

# Final Stage (Production Runtime)
FROM alpine:3.21

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install runtime dependencies (ca-certificates for HTTPS, tzdata for timezones)
RUN apk add --no-cache ca-certificates tzdata

# Copy binaries and assets from builder
COPY --from=builder /app/api /app/api
COPY --from=builder /app/worker /app/worker
COPY --from=builder /app/migrate /app/migrate
COPY --from=builder /app/start.sh /app/start.sh
COPY --from=builder /app/internal/db/migrations /app/internal/db/migrations

# Fix permissions and line endings
RUN sed -i 's/\r$//' /app/start.sh && \
    chmod +x /app/start.sh && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

ENTRYPOINT ["/app/start.sh"]
CMD ["/app/api"]
