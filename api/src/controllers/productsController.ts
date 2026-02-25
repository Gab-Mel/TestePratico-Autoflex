import { Request, Response } from "express";
import { getConnection } from "../db";

export async function getAll(req: Request, res: Response) {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT cod, name, value FROM products`
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no banco" });
  } finally {
    if (conn) await conn.close();
  }
}