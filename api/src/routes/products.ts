import { Router } from "express";
import { getConnection } from "../db";
import { saveProductFull } from "../services/productService";
import { registerHistory } from "../utils/history";

/* =========================
   Types
========================= */
type Product = {
  cod: number;
  name: string;
  value: number;
};

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
    const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";
    const conn = getConnection();
    const { name, value } = req.body;
    
    const result = conn.execute(
      `
      INSERT INTO products (name, value)
      VALUES (?, ?)
      `,
      [name, value]
    );

    const productId = Number(result.lastInsertRowid);

    await registerHistory({
      table: "products",
      lineId: productId,
      column: "name",
      newValue: name,
      responsible,
    });

    await registerHistory({
      table: "products",
      lineId: productId,
      column: "value",
      newValue: value,
      responsible,
    });

    res.status(201).json({
      cod: productId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

router.post("/full", (req, res) => {

  try {
    const { name, value, requirements } = req.body;

    const id = saveProductFull(
      null,
      name,
      value,
      requirements
    );

    res.status(201).json({ cod: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar produto" });
  }
});

/* =========================
   MUTATE
========================= */
router.put("/:id", async (req, res) => {
  const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";
  
  const { id } = req.params;
  const { name, value } = req.body;

  const conn = getConnection();

  const old = await conn.execute(
    "SELECT * FROM products WHERE cod = ?",
    [id]
  ) as { rows: Product[] };
  const oldProduct = old.rows[0];

  const result = await conn.execute(
    `UPDATE products
     SET name = ?, value = ?
     WHERE cod = ?`,
    [name, value, Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  if (oldProduct.name !== name) {
    await registerHistory({
      table: "products",
      lineId: Number(id),
      column: "name",
      oldValue: oldProduct.name,
      newValue: name,
      responsible,
    });
  }

  if (oldProduct.value !== value) {
    await registerHistory({
      table: "products",
      lineId: Number(id),
      column: "value",
      oldValue: oldProduct.value,
      newValue: value,
      responsible,
    });
  }

  res.json({ success: true });
});

router.put("/full/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, requirements } = req.body;

    saveProductFull(
      Number(id),
      name,
      value,
      requirements
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

/* =========================
   DELETE
========================= */
router.delete("/:id", async (req, res) => {
  const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";
  const { id } = req.params;

  const conn = getConnection();

  const old = await conn.execute(
    "SELECT * FROM products WHERE cod = ?",
    [id]
  ) as { rows: Product[] };
  const oldProduct = old.rows[0];

  const result = await conn.execute(
    "DELETE FROM products WHERE cod = ?",
    [Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  await registerHistory({
    table: "products",
    lineId: Number(id),
    column: "ALL",
    oldValue: JSON.stringify(oldProduct.name) + " | " + JSON.stringify(oldProduct.value),
    newValue: "DELETED",
    responsible,
  });

  res.status(204).send();
});

export default router;