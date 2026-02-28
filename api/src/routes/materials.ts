import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
   LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();

  const result = await conn.execute(
    "SELECT * FROM raw_materials ORDER BY cod DESC"
  );

  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
  const { name, amount, cust, unit_measure } = req.body;

  const conn = getConnection();

  await conn.execute(
    `INSERT INTO raw_materials
     (name, amount, cust, unit_measure)
     VALUES (?, ?, ?, ?)`,
    [name, amount, cust, unit_measure]
  );

  res.json({ success: true });
});

/* =========================
   ATUALIZAR (MUTATE)
========================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, amount, cust, unit_measure } = req.body;

  const conn = getConnection();

  const result = await conn.execute(
    `UPDATE raw_materials
     SET name = ?, amount = ?, cust = ?, unit_measure = ?
     WHERE cod = ?`,
    [name, amount, cust, unit_measure, Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Material não encontrado" });
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
    `DELETE FROM raw_materials WHERE cod = ?`,
    [Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Material não encontrado" });
  }

  res.status(204).send();
});

export default router;