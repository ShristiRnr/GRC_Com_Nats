FROM golang:1.24-alpine AS build-env

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o api ./cmd/api
RUN go build -o worker ./cmd/worker

# Download migrate tool
RUN apk add --no-cache curl
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.2/migrate.linux-amd64.tar.gz | tar xvz && mv migrate /app/migrate

FROM alpine:latest
WORKDIR /app

COPY --from=build-env /app/api /app/api
COPY --from=build-env /app/worker /app/worker
COPY --from=build-env /app/migrate /app/migrate
COPY --from=build-env /app/app.env /app/app.env
COPY --from=build-env /app/start.sh /app/start.sh
COPY --from=build-env /app/internal/db/migrations /app/internal/db/migrations

# Note: We will use environment variables in docker-compose to override app.env
ENTRYPOINT ["/app/start.sh"]
CMD ["/app/api"]
