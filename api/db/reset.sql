BEGIN;
TRUNCATE demo_orders RESTART IDENTITY;
INSERT INTO demo_orders (item, quantity, status) VALUES
  ('Wild mushroom risotto', 2, 'new'),
  ('Roasted vegetable bowl', 1, 'preparing'),
  ('Lemon herb pasta', 3, 'ready');
COMMIT;
