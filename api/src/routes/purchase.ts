import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
   LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();
    const result = await conn.execute(
    "SELECT * FROM raw_material_purchase_history ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
  const responsible = req.headers["x-user"]?.toString() ?? "unknown";
  const { cod_raw, amount } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
    "INSERT INTO raw_material_purchase_history (cod_raw, quantity, responsible) VALUES (?, ?, ?)",
    [cod_raw, amount, responsible]
    );
    await conn.execute(
      `
      UPDATE raw_materials
      SET amount = amount + ?
      WHERE cod = ?
      `,
      [amount, cod_raw]
    );
    const purchaseId = (result as any).lastInsertRowid;
    res.status(201).json({
        cod: purchaseId,
    });
});

/* =========================
   ATUALIZAR
========================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { cod_raw, amount, cust, unit_measure } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
    `UPDATE raw_material_purchase_history
     SET cod_raw = ?, quantity = ?
     WHERE id = ?`,
    [cod_raw, amount, Number(id)]
    );
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Compra não encontrada" });
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
    "DELETE FROM raw_material_purchase_history WHERE id = ?",
    [Number(id)]
    );
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Compra não encontrada" });
    }
    res.json({ success: true });
});

export default router;
