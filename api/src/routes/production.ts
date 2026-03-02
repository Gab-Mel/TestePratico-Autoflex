import { Router } from "express";
import { getConnection } from "../db";
import { registerHistory } from "../utils/history";

const router = Router();

/* =========================
   Types
========================= */
type ProductionHistory = {
  id: number;
  cod_product: number;
  quantity: number;
  responsible: string;
};

/* =========================
    LISTAR
========================= */
router.get("/", async (_, res) => {
  const conn = getConnection();
  const result = await conn.execute(
    "SELECT * FROM production_history ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* =========================
   INSERIR
========================= */
router.post("/", async (req, res) => {
  const { cod_product, amount } = req.body;
  const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";

  const conn = getConnection();

  try {
    /* =========================
       1️⃣ Buscar relations
    ========================= */

    const relResult = await conn.execute(
      `SELECT cod_raw, amount
       FROM products_raw_materials
       WHERE cod_product = ?`,
      [cod_product]
    ) as { rows: { cod_raw: number; amount: number }[] };

    const relations = relResult.rows;

    if (!relations.length) {
      return res.status(400).json({
        error: "Produto não possui matérias-primas",
      });
    }

    /* =========================
       2️⃣ Validar estoque
    ========================= */

    for (const rel of relations) {
      const mat = await conn.execute(
        "SELECT * FROM raw_materials WHERE cod = ?",
        [rel.cod_raw]
      ) as { rows: any[] };

      const material = mat.rows[0];

      const needed = rel.amount * amount;

      if (material.amount < needed) {
        return res.status(400).json({
          error: `Estoque insuficiente para ${material.name}`,
        });
      }
    }

    /* =========================
       3️⃣ Consumir materiais
    ========================= */

    for (const rel of relations) {
      const mat = await conn.execute(
        "SELECT * FROM raw_materials WHERE cod = ?",
        [rel.cod_raw]
      ) as { rows: any[] };

      const material = mat.rows[0];

      const consumption = rel.amount * amount;
      const newAmount = material.amount - consumption;

      await conn.execute(
        `UPDATE raw_materials
         SET amount = ?
         WHERE cod = ?`,
        [newAmount, rel.cod_raw]
      );

      /* histórico automático */
      await registerHistory({
        table: "raw_materials",
        lineId: rel.cod_raw,
        column: "amount",
        oldValue: String(material.amount),
        newValue: String(newAmount),
        responsible,
      });
    }

    /* =========================
       4️⃣ Registrar produção
    ========================= */

    const result = await conn.execute(
      `INSERT INTO production_history
       (cod_product, quantity, responsible)
       VALUES (?, ?, ?)`,
      [cod_product, amount, responsible]
    );

    const productionId = Number(result.lastInsertRowid);

    await registerHistory({
      table: "production_history",
      lineId: productionId,
      column: "ALL",
      newValue: JSON.stringify({ cod_product, quantity: amount }),
      responsible,
    });

    res.status(201).json({ id: productionId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao produzir" });
  }
});

/* =========================
    ATUALIZAR
========================= */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { cod_product, quantity } = req.body;
    const responsible = req.headers["x-user"]?.toString() ?? "unknown";
    const conn = getConnection();
    const old = await conn.execute(
        "SELECT * FROM production_history WHERE id = ?",
        [id]
    ) as { rows: ProductionHistory[] };
    const oldData = old.rows[0];

    const result = await conn.execute(
    `UPDATE production_history
        SET cod_product = ?, quantity = ?, responsible = ?
        WHERE id = ?`,
    [cod_product, quantity, responsible, Number(id)]
    );  
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produção não encontrada" });
    }

    await registerHistory({
        table: "production_history",
        lineId: Number(id),
        column: "ALL",
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify({ cod_product, quantity }),
        responsible,
    });
    res.json({ success: true });
});

/* =========================        
    DELETAR
========================= */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const conn = getConnection();
    const old = await conn.execute(
        "SELECT * FROM production_history WHERE id = ?",
        [id]
    ) as { rows: ProductionHistory[] };
    const oldData = old.rows[0];
    const responsible = req.headers["x-user"]?.toString() ?? "unknown";

    const result = await conn.execute(
    "DELETE FROM production_history WHERE id = ?",
    [Number(id)]
    );
    if (!result.rowsAffected) {
    return res.status(404).json({ error: "Produção não encontrada" });
    }

    await registerHistory({
        table: "production_history",
        lineId: Number(id),
        column: "ALL",
        oldValue: JSON.stringify(oldData),
        newValue: "DELETED",
        responsible,
    });
    res.json({ success: true });
});

export default router;
