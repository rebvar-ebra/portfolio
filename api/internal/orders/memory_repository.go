package orders

import (
	"context"
	"sort"
	"sync"
	"time"
)

type MemoryRepository struct {
	mu     sync.RWMutex
	nextID int64
	orders map[int64]Order
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{nextID: 1, orders: make(map[int64]Order)}
}

func (repository *MemoryRepository) List(_ context.Context, status Status) ([]Order, error) {
	repository.mu.RLock()
	defer repository.mu.RUnlock()

	result := make([]Order, 0, len(repository.orders))
	for _, order := range repository.orders {
		if status == "" || order.Status == status {
			result = append(result, order)
		}
	}
	sort.Slice(result, func(left, right int) bool { return result[left].CreatedAt.After(result[right].CreatedAt) })
	return result, nil
}

func (repository *MemoryRepository) Get(_ context.Context, id int64) (Order, error) {
	repository.mu.RLock()
	defer repository.mu.RUnlock()
	order, exists := repository.orders[id]
	if !exists {
		return Order{}, ErrNotFound
	}
	return order, nil
}

func (repository *MemoryRepository) Create(_ context.Context, input CreateInput) (Order, error) {
	repository.mu.Lock()
	defer repository.mu.Unlock()
	now := time.Now().UTC()
	order := Order{ID: repository.nextID, Item: input.Item, Quantity: input.Quantity, Status: StatusNew, CreatedAt: now, UpdatedAt: now}
	repository.orders[order.ID] = order
	repository.nextID++
	return order, nil
}

func (repository *MemoryRepository) UpdateStatus(_ context.Context, id int64, status Status) (Order, error) {
	repository.mu.Lock()
	defer repository.mu.Unlock()
	order, exists := repository.orders[id]
	if !exists {
		return Order{}, ErrNotFound
	}
	order.Status = status
	order.UpdatedAt = time.Now().UTC()
	repository.orders[id] = order
	return order, nil
}

func (repository *MemoryRepository) Stats(_ context.Context) (Stats, error) {
	repository.mu.RLock()
	defer repository.mu.RUnlock()
	stats := Stats{Total: len(repository.orders)}
	for _, order := range repository.orders {
		switch order.Status {
		case StatusNew:
			stats.New++
		case StatusPreparing:
			stats.Preparing++
		case StatusReady:
			stats.Ready++
		}
	}
	return stats, nil
}

func (repository *MemoryRepository) Reset(_ context.Context) error {
	repository.mu.Lock()
	defer repository.mu.Unlock()
	repository.orders = make(map[int64]Order)
	repository.nextID = 1
	return nil
}
