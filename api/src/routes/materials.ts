import { Router } from "express";
import { getConnection } from "../db";
import { registerHistory } from "../utils/history";

const router = Router();

/* =========================
   Types
========================= */
type RawMaterial = {
  cod: number;
  name: string;
  amount: number;
  cust: number;
  unit_measure: string;
};

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
  const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";


  const conn = getConnection();

  const result = await conn.execute(
    `INSERT INTO raw_materials
     (name, amount, cust, unit_measure)
     VALUES (?, ?, ?, ?)`,
    [name, amount, cust, unit_measure]
  );

  const rawMaterialId = Number(result.lastInsertRowid)

  await registerHistory({
    table: "raw_materials",
    lineId: rawMaterialId,
    column: "name",
    newValue: name,
    responsible,
  });


  res.json({ success: true });
});

/* =========================
   ATUALIZAR (MUTATE)
========================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, amount, cust, unit_measure } = req.body;
  const responsible =
    req.headers["x-user"]?.toString() ?? "unknown";

  const conn = getConnection();
  const old = await conn.execute(
    "SELECT * FROM raw_materials WHERE cod = ?",
    [id]
  ) as { rows: RawMaterial[] };

  const oldRaw = old.rows[0];

  const result = await conn.execute(
    `UPDATE raw_materials
     SET name = ?, amount = ?, cust = ?, unit_measure = ?
     WHERE cod = ?`,
    [name, amount, cust, unit_measure, Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Material não encontrado" });
  }

  if (oldRaw.name !== name) {
    await registerHistory({
      table: "raw_materials",
      lineId: Number(id),
      column: "name",
      oldValue: oldRaw.name,
      newValue: name,
      responsible,
    });
  }

  if (oldRaw.amount !== amount) {
    await registerHistory({
      table: "raw_materials",
      lineId: Number(id),
      column: "amount",
      oldValue: String(oldRaw.amount),
      newValue: String(amount),
      responsible,
    });
  }

  if (oldRaw.cust !== cust) {
    await registerHistory({
      table: "raw_materials",
      lineId: Number(id),
      column: "cust",
      oldValue: String(oldRaw.cust),
      newValue: String(cust),
      responsible,
    });
  }

  if (oldRaw.unit_measure !== unit_measure) {
    await registerHistory({
      table: "raw_materials",
      lineId: Number(id),
      column: "unit_measure",
      oldValue: oldRaw.unit_measure,
      newValue: unit_measure,
      responsible,
    });
  }




  res.json({ success: true });
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
    "SELECT * FROM raw_materials WHERE cod = ?",
    [id]
  ) as { rows: RawMaterial[] };

  const result = await conn.execute(
    `DELETE FROM raw_materials WHERE cod = ?`,
    [Number(id)]
  );

  if (!result.rowsAffected) {
    return res.status(404).json({ error: "Material não encontrado" });
  }

  await registerHistory({
    table: "raw_materials",
    lineId: Number(id),
    column: "ALL",
    oldValue: JSON.stringify(old.rows[0]),
    newValue: "DELETED",
    responsible,
  });

  res.status(204).send();
});

export default router;