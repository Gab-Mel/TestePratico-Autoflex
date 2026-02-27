import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* LISTAR */
router.get("/", async (_, res) => {
  const conn = getConnection();

  const result = await conn.execute(
    "SELECT * FROM raw_materials ORDER BY cod DESC"
  );

  res.json(result.rows);
});

/* INSERIR */
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

export default router;