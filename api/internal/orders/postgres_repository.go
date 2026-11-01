package orders

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (repository *PostgresRepository) List(ctx context.Context, status Status) ([]Order, error) {
	rows, err := repository.pool.Query(ctx, `
		SELECT id, item, quantity, status, created_at, updated_at
		FROM demo_orders
		WHERE ($1 = '' OR status = $1)
		ORDER BY created_at DESC`, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]Order, 0)
	for rows.Next() {
		var order Order
		if err := rows.Scan(&order.ID, &order.Item, &order.Quantity, &order.Status, &order.CreatedAt, &order.UpdatedAt); err != nil {
			return nil, err
		}
		result = append(result, order)
	}
	return result, rows.Err()
}

func (repository *PostgresRepository) Get(ctx context.Context, id int64) (Order, error) {
	var order Order
	err := repository.pool.QueryRow(ctx, `
		SELECT id, item, quantity, status, created_at, updated_at
		FROM demo_orders WHERE id = $1`, id).
		Scan(&order.ID, &order.Item, &order.Quantity, &order.Status, &order.CreatedAt, &order.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Order{}, ErrNotFound
	}
	return order, err
}

func (repository *PostgresRepository) Create(ctx context.Context, input CreateInput) (Order, error) {
	var order Order
	err := repository.pool.QueryRow(ctx, `
		INSERT INTO demo_orders (item, quantity, status)
		VALUES ($1, $2, 'new')
		RETURNING id, item, quantity, status, created_at, updated_at`, input.Item, input.Quantity).
		Scan(&order.ID, &order.Item, &order.Quantity, &order.Status, &order.CreatedAt, &order.UpdatedAt)
	return order, err
}

func (repository *PostgresRepository) UpdateStatus(ctx context.Context, id int64, status Status) (Order, error) {
	var order Order
	err := repository.pool.QueryRow(ctx, `
		UPDATE demo_orders SET status = $2, updated_at = NOW()
		WHERE id = $1
		RETURNING id, item, quantity, status, created_at, updated_at`, id, status).
		Scan(&order.ID, &order.Item, &order.Quantity, &order.Status, &order.CreatedAt, &order.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Order{}, ErrNotFound
	}
	return order, err
}

func (repository *PostgresRepository) Stats(ctx context.Context) (Stats, error) {
	var stats Stats
	err := repository.pool.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'new'),
		COUNT(*) FILTER (WHERE status = 'preparing'), COUNT(*) FILTER (WHERE status = 'ready')
		FROM demo_orders`).Scan(&stats.Total, &stats.New, &stats.Preparing, &stats.Ready)
	return stats, err
}

func (repository *PostgresRepository) Reset(ctx context.Context) error {
	transaction, err := repository.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = transaction.Rollback(ctx) }()

	if _, err := transaction.Exec(ctx, `TRUNCATE demo_orders RESTART IDENTITY`); err != nil {
		return err
	}
	if _, err := transaction.Exec(ctx, `
		INSERT INTO demo_orders (item, quantity, status) VALUES
		('Wild mushroom risotto', 2, 'new'),
		('Roasted vegetable bowl', 1, 'preparing'),
		('Lemon herb pasta', 3, 'ready')`); err != nil {
		return err
	}
	return transaction.Commit(ctx)
}
