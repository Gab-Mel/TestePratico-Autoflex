import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
   LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();

  const result = await conn.execute(
    "SELECT * FROM products ORDER BY cod DESC"
  );

  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
  try {
    const conn = getConnection();
    const { name, value } = req.body;

    const result = conn.execute(
      `INSERT INTO products (name, value)
       VALUES (?, ?)`,
      [name, value]
    );

    // ✅ PEGAR ID GERADO PELO SQLITE
    const productId = (result as any).lastInsertRowid;

    res.status(201).json({
      cod: productId,
    });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar produto" });
    }
});

/* =========================
   ATUALIZAR
========================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, value } = req.body;

  const conn = getConnection();

  const result = await conn.execute(
    `UPDATE products
     SET name = ?, value = ?
     WHERE cod = ?`,
    [name, value, Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  res.json({ success: true });
});

/* =========================
   DELETE
========================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const conn = getConnection();

  const result = await conn.execute(
    "DELETE FROM products WHERE cod = ?",
    [Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  res.status(204).send();
});

export default router;