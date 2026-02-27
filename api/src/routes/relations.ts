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
      FROM products_and_materials
      ORDER BY product_id
    `);

    res.json(result.rows);
  } catch (err) {
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
      FROM products_and_materials
      WHERE product_id = ?
      `,
      [productId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar relações do produto" });
  }
});

/**
 * CRIAR RELAÇÃO
 */
router.post("/", (req, res) => {
  try {
    const conn = getConnection();
    const { product_id, material_id, quantity } = req.body;

    conn.execute(
      `
      INSERT INTO products_and_materials
      (product_id, material_id, quantity)
      VALUES (?, ?, ?)
      `,
      [product_id, material_id, quantity]
    );

    res.status(201).json({ message: "Relação criada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar relação" });
  }
});

/**
 * ATUALIZAR RELAÇÃO
 */
router.put("/:id", (req, res) => {
  try {
    const conn = getConnection();
    const { id } = req.params;
    const { quantity } = req.body;

    conn.execute(
      `
      UPDATE products_and_materials
      SET quantity = ?
      WHERE id = ?
      `,
      [quantity, id]
    );

    res.json({ message: "Relação atualizada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar relação" });
  }
});

/**
 * DELETAR RELAÇÃO
 */
router.delete("/:id", (req, res) => {
  try {
    const conn = getConnection();
    const { id } = req.params;

    conn.execute(
      `
      DELETE FROM products_and_materials
      WHERE id = ?
      `,
      [id]
    );

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar relação" });
  }
});

export default router;