PRAGMA foreign_keys = ON;

-- =========================
-- RAW MATERIALS
-- =========================
INSERT OR IGNORE INTO raw_materials
(cod, name, amount, cust, unit_measure)
VALUES
(1, 'Madeira',   120, 15.50, 'm'),
(2, 'Ferro',      80, 22.00, 'kg'),
(3, 'Parafuso',  500,  0.15, 'un'),
(4, 'Plástico',  200,  6.30, 'kg');


-- =========================
-- PRODUCTS
-- =========================
INSERT OR IGNORE INTO products
(cod, name, value)
VALUES
(1, 'Mesa',     350.00),
(2, 'Cadeira',  180.00),
(3, 'Estante',  520.00);


-- =========================
-- PRODUCTS x RAW MATERIALS
-- =========================
INSERT OR IGNORE INTO products_raw_materials
(cod_product, cod_raw, amount)
VALUES
-- Mesa
(1, 1, 12),   -- madeira (m)
(1, 3, 24),   -- parafusos (un)

-- Cadeira
(2, 1, 6),
(2, 3, 12),

-- Estante
(3, 1, 20),
(3, 2, 8),
(3, 3, 40);