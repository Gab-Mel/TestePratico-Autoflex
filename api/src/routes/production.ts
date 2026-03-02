import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
    LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();
    const result = await conn.execute(
    "SELECT * FROM production_history ORDER BY cod DESC"
  );
  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
    const { cod_product, amount, cust, unit_measure } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
    "INSERT INTO production_history (cod_product, amount, cust, unit_measure) VALUES (?, ?, ?, ?)",
    [cod_product, amount, cust, unit_measure]
  );
    const productionId = (result as any).lastInsertRowid;
    res.status(201).json({
        cod: productionId,
    });
});

/* =========================
    ATUALIZAR
========================= */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { cod_product, amount, cust, unit_measure } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
    `UPDATE production_history
        SET cod_product = ?, amount = ?, cust = ?, unit_measure = ?
        WHERE cod = ?`,
    [cod_product, amount, cust, unit_measure, Number(id)]
    );  
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produção não encontrada" });
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
    "DELETE FROM production_history WHERE cod = ?",
    [Number(id)]
    );
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produção não encontrada" });
    }
    res.json({ success: true });
});

export default router;
