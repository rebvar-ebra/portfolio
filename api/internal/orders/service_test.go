package orders_test

import (
	"context"
	"errors"
	"testing"

	"github.com/rebvar/rebvar-studio/api/internal/orders"
)

func TestCreateRejectsInvalidInputWithoutMutatingRepository(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)

	tests := []struct {
		name  string
		input orders.CreateInput
	}{
		{name: "blank item", input: orders.CreateInput{Item: " ", Quantity: 1}},
		{name: "item too long", input: orders.CreateInput{Item: string(make([]byte, 81)), Quantity: 1}},
		{name: "zero quantity", input: orders.CreateInput{Item: "Mushroom ramen", Quantity: 0}},
		{name: "excessive quantity", input: orders.CreateInput{Item: "Mushroom ramen", Quantity: 21}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := service.Create(context.Background(), test.input)
			if !errors.Is(err, orders.ErrInvalidInput) {
				t.Fatalf("expected invalid input, got %v", err)
			}
		})
	}

	got, err := service.List(context.Background(), "")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 0 {
		t.Fatalf("expected no orders, got %d", len(got))
	}
}

func TestStatusTransitionsMoveForwardOneStage(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	order, err := service.Create(context.Background(), orders.CreateInput{Item: "Herb pasta", Quantity: 2})
	if err != nil {
		t.Fatal(err)
	}

	if _, err := service.UpdateStatus(context.Background(), order.ID, orders.StatusReady); !errors.Is(err, orders.ErrInvalidTransition) {
		t.Fatalf("expected invalid transition, got %v", err)
	}

	preparing, err := service.UpdateStatus(context.Background(), order.ID, orders.StatusPreparing)
	if err != nil {
		t.Fatal(err)
	}
	if preparing.Status != orders.StatusPreparing {
		t.Fatalf("expected preparing, got %q", preparing.Status)
	}

	ready, err := service.UpdateStatus(context.Background(), order.ID, orders.StatusReady)
	if err != nil {
		t.Fatal(err)
	}
	if ready.Status != orders.StatusReady {
		t.Fatalf("expected ready, got %q", ready.Status)
	}
}

func TestListFiltersAndStatsReflectCurrentState(t *testing.T) {
	repo := orders.NewMemoryRepository()
	service := orders.NewService(repo)
	first, _ := service.Create(context.Background(), orders.CreateInput{Item: "Garden bowl", Quantity: 1})
	_, _ = service.Create(context.Background(), orders.CreateInput{Item: "Lentil soup", Quantity: 3})
	_, _ = service.UpdateStatus(context.Background(), first.ID, orders.StatusPreparing)

	filtered, err := service.List(context.Background(), string(orders.StatusPreparing))
	if err != nil {
		t.Fatal(err)
	}
	if len(filtered) != 1 || filtered[0].Item != "Garden bowl" {
		t.Fatalf("unexpected filtered orders: %#v", filtered)
	}

	stats, err := service.Stats(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if stats.Total != 2 || stats.New != 1 || stats.Preparing != 1 || stats.Ready != 0 {
		t.Fatalf("unexpected stats: %#v", stats)
	}
}
