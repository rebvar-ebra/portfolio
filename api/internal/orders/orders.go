package orders

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Status string

const (
	StatusNew       Status = "new"
	StatusPreparing Status = "preparing"
	StatusReady     Status = "ready"
)

var (
	ErrInvalidInput      = errors.New("invalid order input")
	ErrInvalidStatus     = errors.New("invalid order status")
	ErrInvalidTransition = errors.New("invalid order status transition")
	ErrNotFound          = errors.New("order not found")
)

type Order struct {
	ID        int64     `json:"id"`
	Item      string    `json:"item"`
	Quantity  int       `json:"quantity"`
	Status    Status    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateInput struct {
	Item     string `json:"item"`
	Quantity int    `json:"quantity"`
}

type Stats struct {
	Total     int `json:"total"`
	New       int `json:"new"`
	Preparing int `json:"preparing"`
	Ready     int `json:"ready"`
}

type Repository interface {
	List(context.Context, Status) ([]Order, error)
	Get(context.Context, int64) (Order, error)
	Create(context.Context, CreateInput) (Order, error)
	UpdateStatus(context.Context, int64, Status) (Order, error)
	Stats(context.Context) (Stats, error)
	Reset(context.Context) error
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func ParseStatus(value string) (Status, error) {
	status := Status(value)
	if status != StatusNew && status != StatusPreparing && status != StatusReady {
		return "", fmt.Errorf("%w: %q", ErrInvalidStatus, value)
	}

	return status, nil
}

func (service *Service) List(ctx context.Context, rawStatus string) ([]Order, error) {
	if rawStatus == "" {
		return service.repository.List(ctx, "")
	}

	status, err := ParseStatus(rawStatus)
	if err != nil {
		return nil, err
	}

	return service.repository.List(ctx, status)
}

func (service *Service) Create(ctx context.Context, input CreateInput) (Order, error) {
	input.Item = strings.TrimSpace(input.Item)
	if len(input.Item) < 2 || len(input.Item) > 80 || input.Quantity < 1 || input.Quantity > 20 {
		return Order{}, ErrInvalidInput
	}

	return service.repository.Create(ctx, input)
}

func (service *Service) UpdateStatus(ctx context.Context, id int64, next Status) (Order, error) {
	if _, err := ParseStatus(string(next)); err != nil {
		return Order{}, err
	}

	current, err := service.repository.Get(ctx, id)
	if err != nil {
		return Order{}, err
	}

	isAllowed := (current.Status == StatusNew && next == StatusPreparing) ||
		(current.Status == StatusPreparing && next == StatusReady)
	if !isAllowed {
		return Order{}, ErrInvalidTransition
	}

	return service.repository.UpdateStatus(ctx, id, next)
}

func (service *Service) Stats(ctx context.Context) (Stats, error) {
	return service.repository.Stats(ctx)
}

func (service *Service) Reset(ctx context.Context) error {
	return service.repository.Reset(ctx)
}
