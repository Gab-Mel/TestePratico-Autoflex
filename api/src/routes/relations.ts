import { Router } from "express";
import { getConnection } from "../db";

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

/**
 * CRIAR RELAÇÃO
 */
router.post("/", (req, res) => {
  try {
    const conn = getConnection();
    const { cod_product, cod_raw, amount } = req.body;

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

/**
 * ATUALIZAR RELAÇÃO
 */
router.put("/", (req, res) => {
  try {
    const conn = getConnection();
    const { cod_product, cod_raw, amount } = req.body;

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

/**
 * DELETAR RELAÇÃO
 */
router.delete("/", (req, res) => {
  try {
    const conn = getConnection();
    const { cod_product, cod_raw } = req.body;

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