FROM golang:1.23-alpine AS build-env

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o api ./cmd/api
RUN go build -o worker ./cmd/worker

FROM alpine:latest
WORKDIR /app

COPY --from=build-env /app/api /app/api
COPY --from=build-env /app/worker /app/worker
COPY --from=build-env /app/app.env /app/app.env

# Note: We will use environment variables in docker-compose to override app.env
CMD ["/app/api"]
