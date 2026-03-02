import { Router } from "express";
import { getConnection } from "../db";
import { registerHistory } from "../utils/history";

/* =========================
    Types
========================= */
type ProductRawRelation = {
  cod_product: number;
  cod_raw: number;
  amount: number;
};

const router = Router();

/**
 * LISTAR TODAS AS RELAÇÕES
 */
router.get("/", (req, res) => {
  try {
    const conn = getConnection();

    const result = conn.execute(`
      SELECT *
      FROM products_raw_materials
      ORDER BY cod_product
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar relações" });
  }
});

/**
 * RELAÇÕES POR PRODUTO
 */
router.get("/product/:productId", (req, res) => {
  try {
    const conn = getConnection();
    const { productId } = req.params;

    const result = conn.execute(
      `
      SELECT *
      FROM products_raw_materials
      WHERE cod_product = ?
      `,
      [Number(productId)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar relações" });
  }
});

/* =========================
   Insert
========================= */
router.post("/", async (req, res) => {
  try {
    const responsible =
      req.headers["x-user"]?.toString() ?? "unknown";
    const conn = getConnection();
    const { cod_product, cod_raw, amount } = req.body;

    await registerHistory({
      table: "products_raw_materials",
      lineId: cod_product,
      column: `raw_${cod_raw}`,
      newValue: amount,
      responsible,
    });

    conn.execute(
      `
      INSERT INTO products_raw_materials
      (cod_product, cod_raw, amount)
      VALUES (?, ?, ?)
      `,
      [cod_product, cod_raw, amount]
    );

    res.status(201).json({ message: "Relação criada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar relação" });
  }
});

/* =========================
   Mutate
========================= */
router.put("/", async (req, res) => {
  try {
    const responsible =
      req.headers["x-user"]?.toString() ?? "unknown";
    const conn = getConnection();

    const { cod_product, cod_raw, amount } = req.body;
    const old = await conn.execute(
      `SELECT amount FROM products_raw_materials
      WHERE cod_product=? AND cod_raw=?`,
      [cod_product, cod_raw]
    ) as { rows: { amount: number }[] };

    
    const oldAmount = old.rows[0]?.amount;

    if (oldAmount !== amount) {
      await registerHistory({
        table: "products_raw_materials",
        lineId: cod_product,
        column: `raw_${cod_raw}`,
        oldValue: oldAmount,
        newValue: amount,
        responsible,
      });
    }

    conn.execute(
      `
      UPDATE products_raw_materials
      SET amount = ?
      WHERE cod_product = ? AND cod_raw = ?
      `,
      [amount, cod_product, cod_raw]
    );

    res.json({ message: "Relação atualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar relação" });
  }
});

/* =========================
   Delete
========================= */
router.delete("/", async(req, res) => {
  try {
    const responsible =
      req.headers["x-user"]?.toString() ?? "unknown";
    const conn = getConnection();
    const { cod_product, cod_raw } = req.body;

    const old = await conn.execute(
      `SELECT amount FROM products_raw_materials
      WHERE cod_product=? AND cod_raw=?`,
      [cod_product, cod_raw]
    ) as { rows: { amount: number }[] };

    await registerHistory({
      table: "products_raw_materials",
      lineId: cod_product,
      column: `raw_${cod_raw}`,
      oldValue: old.rows[0]?.amount,
      newValue: "DELETED",
      responsible,
    });

    conn.execute(
      `
      DELETE FROM products_raw_materials
      WHERE cod_product = ? AND cod_raw = ?
      `,
      [cod_product, cod_raw]
    );

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar relação" });
  }
});

export default router;