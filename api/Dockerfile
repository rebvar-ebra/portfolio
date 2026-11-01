FROM golang:1.26-alpine AS builder
WORKDIR /src
COPY api/go.mod api/go.sum ./
RUN go mod download
COPY api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/portfolio-api ./cmd/server

FROM alpine:3.23
RUN addgroup -S app && adduser -S -G app app
COPY --from=builder /out/portfolio-api /usr/local/bin/portfolio-api
USER app
EXPOSE 8080
ENTRYPOINT ["portfolio-api"]
