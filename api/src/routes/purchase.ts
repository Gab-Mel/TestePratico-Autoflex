import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
   LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();
    const result = await conn.execute(
    "SELECT * FROM raw_material_purchase_history ORDER BY cod DESC"
  );
  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
  const { cod_raw, amount, cust, unit_measure } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
    "INSERT INTO raw_material_purchase_history (cod_raw, amount, cust, unit_measure) VALUES (?, ?, ?, ?)",
    [cod_raw, amount, cust, unit_measure]
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
     SET cod_raw = ?, amount = ?, cust = ?, unit_measure = ?
     WHERE cod = ?`,
    [cod_raw, amount, cust, unit_measure, Number(id)]
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
    "DELETE FROM raw_material_purchase_history WHERE cod = ?",
    [Number(id)]
    );
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Compra não encontrada" });
    }
    res.json({ success: true });
});

export default router;
