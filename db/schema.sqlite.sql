PRAGMA foreign_keys = ON;

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value REAL NOT NULL
);

-- =========================
-- RAW MATERIALS
-- =========================
CREATE TABLE raw_materials (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    cust REAL NOT NULL,
    unit_measure REAL NOT NULL
);

-- =========================
-- PRODUCTS x RAW MATERIALS
-- =========================
CREATE TABLE products_raw_materials (
    cod_product INTEGER NOT NULL,
    cod_raw INTEGER NOT NULL,
    quantidade REAL NOT NULL,

    PRIMARY KEY (cod_product, cod_raw),

    FOREIGN KEY (cod_product)
        REFERENCES products(cod)
        ON DELETE CASCADE,

    FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod)
        ON DELETE CASCADE
);

-- =========================
-- EXPECTED LEFTOVERS
-- =========================
CREATE TABLE expected_leftovers (
    cod_product INTEGER NOT NULL,
    cod_raw INTEGER NOT NULL,
    quantidade REAL NOT NULL,

    PRIMARY KEY (cod_product, cod_raw),

    FOREIGN KEY (cod_product)
        REFERENCES products(cod)
        ON DELETE CASCADE,

    FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod)
        ON DELETE CASCADE
);

-- =========================
-- PRODUCTION HISTORY
-- =========================
CREATE TABLE production_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cod_product INTEGER NOT NULL,
    datatime DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cod_product)
        REFERENCES products(cod)
        ON DELETE CASCADE
);

-- =========================
-- RAW MATERIAL PURCHASE HISTORY
-- =========================
CREATE TABLE raw_material_purchase_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cod_raw INTEGER NOT NULL,
    datatime DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod)
        ON DELETE CASCADE
);