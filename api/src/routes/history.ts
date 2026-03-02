import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
   LISTAR
========================= */

router.get("/", async (_, res) => {
  const conn = getConnection();

  const result = await conn.execute(
    "SELECT * FROM edition_table_history ORDER BY id DESC"
  );

  res.json(result.rows);
});

export default router;

/* =========================
   INSERIR
========================= */

router.post("/", async (req, res) => {
  const { table_name, record_id, field_name, old_value, new_value } = req.body;
    const conn = getConnection();
    
    const result = conn.execute(
      `
      INSERT INTO edition_table_history (table_name, line_id, column_name, old_value, new_value)
      VALUES (?, ?, ?, ?, ?)
      `,
      [table_name, record_id, field_name, old_value, new_value]
    );

    res.status(201).json({
      cod: result.lastInsertRowid
    });
});

/* =========================
   ATUALIZAR
========================= */    
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { table_name, record_id, field_name, old_value, new_value } = req.body;
  const conn = getConnection();

  const result = await conn.execute(
    `UPDATE edition_table_history
     SET table_name = ?, line_id = ?, column_name = ?, old_value = ?, new_value = ?
     WHERE id = ?`,
    [table_name, record_id, field_name, old_value, new_value, Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Histórico não encontrado" });
  }

  res.json({ success: true });
});

/* =========================
    DELETAR
========================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conn = getConnection();
    const result = await conn.execute(
      "DELETE FROM edition_table_history WHERE id = ?",
      [Number(id)]
    );

    if (!result.rowsAffected) {
      return res.status(404).json({ error: "Histórico não encontrado" });
    }

    res.json({ success: true });
});