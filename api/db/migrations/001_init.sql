CREATE TABLE IF NOT EXISTS demo_orders (
  id BIGSERIAL PRIMARY KEY,
  item VARCHAR(80) NOT NULL CHECK (char_length(item) BETWEEN 2 AND 80),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  status VARCHAR(16) NOT NULL CHECK (status IN ('new', 'preparing', 'ready')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_orders_status_created_idx
  ON demo_orders (status, created_at DESC);

INSERT INTO demo_orders (item, quantity, status)
SELECT * FROM (VALUES
  ('Wild mushroom risotto', 2, 'new'),
  ('Roasted vegetable bowl', 1, 'preparing'),
  ('Lemon herb pasta', 3, 'ready')
) AS seed(item, quantity, status)
WHERE NOT EXISTS (SELECT 1 FROM demo_orders);
