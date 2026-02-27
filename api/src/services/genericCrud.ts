import db from "../db";
import { TableName, allowedTables } from "../utils/allowedTables";

function validateTable(table: string): table is TableName {
  return allowedTables.includes(table as TableName);
}

export const create = (table: string, data: Record<string, any>) => {
  if (!validateTable(table)) throw new Error("Invalid table");

  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => "?").join(",");

  const sql = `
    INSERT INTO ${table} (${keys.join(",")})
    VALUES (${placeholders})
  `;

  return db.prepare(sql).run(values);
};

export const findAll = (table: string) => {
  if (!validateTable(table)) throw new Error("Invalid table");

  return db.prepare(`SELECT * FROM ${table}`).all();
};

export const update = (
  table: string,
  id: number,
  data: Record<string, any>
) => {
  if (!validateTable(table)) throw new Error("Invalid table");

  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys.map(key => `${key} = ?`).join(",");

  const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = ?
  `;

  return db.prepare(sql).run([...values, id]);
};

export const remove = (table: string, id: number) => {
  if (!validateTable(table)) throw new Error("Invalid table");

  return db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
};