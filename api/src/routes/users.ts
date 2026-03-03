import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

/* =========================
    Types
========================= */
type User = {
  id: number;
  name: string;
};

/* =========================
    LISTAR
========================= */
router.get("/", async (_, res) => {
    const conn = getConnection();
    const result = await conn.execute(
        "SELECT * FROM users ORDER BY id DESC"
    );
    res.json(result.rows);
});

/* =========================
    INSERIR
========================= */
router.post("/", async (req, res) => {
    const { username, password, role } = req.body;
    const conn = getConnection();
    const result = await conn.execute(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, password, role]
    );
    res.json({ success: true });
});

/* =========================
    LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const conn = getConnection();

  const result = await conn.execute(
    `SELECT username, role
     FROM users
     WHERE username = ? AND password = ?`,
    [username, password]
  ) as { rows: any[] };

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      error: "Usuário ou senha inválidos",
    });
  }

  res.json(user);
});

export default router;