-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    cod NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    value NUMBER(10,2) NOT NULL
);

-- =========================
-- RAW MATERIALS
-- =========================
CREATE TABLE raw_materials (
    cod NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    amount NUMBER(12,3) NOT NULL,
    cust NUMBER(10,2) NOT NULL,
    unit_measure NUMBER(10,3) NOT NULL
);

-- =========================
-- PRODUCTS x RAW MATERIALS
-- =========================
CREATE TABLE products_raw_materials (
    cod_product NUMBER NOT NULL,
    cod_raw NUMBER NOT NULL,
    quantidade NUMBER(12,3) NOT NULL,

    CONSTRAINT fk_prm_product
        FOREIGN KEY (cod_product)
        REFERENCES products(cod),

    CONSTRAINT fk_prm_raw
        FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod),

    CONSTRAINT pk_products_raw
        PRIMARY KEY (cod_product, cod_raw)
);

-- =========================
-- EXPECTED LEFTOVERS
-- =========================
CREATE TABLE expected_leftovers (
    cod_product NUMBER NOT NULL,
    cod_raw NUMBER NOT NULL,
    quantidade NUMBER(12,3) NOT NULL,

    CONSTRAINT fk_el_product
        FOREIGN KEY (cod_product)
        REFERENCES products(cod),

    CONSTRAINT fk_el_raw
        FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod),

    CONSTRAINT pk_expected_leftovers
        PRIMARY KEY (cod_product, cod_raw)
);

-- =========================
-- PRODUCTION HISTORY
-- =========================
CREATE TABLE production_history (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_product NUMBER NOT NULL,
    datatime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ph_product
        FOREIGN KEY (cod_product)
        REFERENCES products(cod)
);

-- =========================
-- RAW MATERIAL PURCHASE HISTORY
-- =========================
CREATE TABLE raw_material_purchase_history (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_raw NUMBER NOT NULL,
    datatime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rmph_raw
        FOREIGN KEY (cod_raw)
        REFERENCES raw_materials(cod)
);