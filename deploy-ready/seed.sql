-- seed: settings and sizes
INSERT INTO settings (id, key, value) VALUES (gen_random_uuid(), 'siteName', 'BHP Perfect'), (gen_random_uuid(), 'bannerShow', 'true'), (gen_random_uuid(), 'bannerText', 'Super oferta!'), (gen_random_uuid(), 'bannerLink', '/shop');

INSERT INTO sizes (id, name, display_order, created_at) VALUES (gen_random_uuid(), 'S', 1, CURRENT_TIMESTAMP), (gen_random_uuid(), 'M', 2, CURRENT_TIMESTAMP), (gen_random_uuid(), 'L', 3, CURRENT_TIMESTAMP), (gen_random_uuid(), 'XL', 4, CURRENT_TIMESTAMP);

-- (For brevity, not including full 60 products here; use your main repo seed.sql if needed)
