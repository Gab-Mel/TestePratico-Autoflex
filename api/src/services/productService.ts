import { getConnection } from "../db";

export function saveProductFull(
  id: number | null,
  name: string,
  value: number,
  requirements: any[]
) {
  const conn = getConnection();

  /* ================= PRODUCT ================= */

  let productId = id;

  if (!id) {
    const result = conn.execute(
      `INSERT INTO products (name, value) VALUES (?, ?)`,
      [name, value]
    );

    const insertedId = result.lastInsertRowid;

    if (insertedId === undefined) {
    throw new Error("Falha ao obter ID inserido");
    }

    productId = Number(insertedId);
  } else {
    conn.execute(
      `UPDATE products SET name=?, value=? WHERE cod=?`,
      [name, value, id]
    );
  }

  /* ================= RELATIONS ================= */

  const current = conn.execute(
    `SELECT * FROM products_raw_materials WHERE cod_product=?`,
    [productId]
  ).rows as any[];

  const currentMap = new Map(
    current.map(r => [r.cod_raw, r])
  );

  const newMap = new Map(
    requirements.map(r => [r.cod_raw, r])
  );

  /* DELETE */
  for (const r of current) {
    if (!newMap.has(r.cod_raw)) {
      conn.execute(
        `DELETE FROM products_raw_materials
         WHERE cod_product=? AND cod_raw=?`,
        [productId, r.cod_raw]
      );
    }
  }

  /* CREATE / UPDATE */
  for (const req of newMap.values()) {
    const exists = currentMap.get(req.cod_raw);

    if (!exists) {
      conn.execute(
        `INSERT INTO products_raw_materials
         (cod_product, cod_raw, amount)
         VALUES (?, ?, ?)`,
        [productId, req.cod_raw, req.amount]
      );
    } else {
      conn.execute(
        `UPDATE products_raw_materials
         SET amount=?
         WHERE cod_product=? AND cod_raw=?`,
        [req.amount, productId, req.cod_raw]
      );
    }
  }

  return productId;
}