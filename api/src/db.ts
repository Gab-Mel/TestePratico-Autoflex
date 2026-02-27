import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(__dirname, "../../db/database.db");
const schemaPath = path.resolve(__dirname, "../../db/schema.sqlite.sql");

const db = new Database(dbPath);

// cria schema automaticamente
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

/**
 * Interface compatível com Oracle
 */
export const getConnection = () => {
  return {
    execute: (sql: string, params: any[] = []) => {
      const stmt = db.prepare(sql);

      if (sql.trim().toUpperCase().startsWith("SELECT")) {
        return { rows: stmt.all(params) };
      }

      const result = stmt.run(params);
      return { rowsAffected: result.changes };
    },

    close: async () => {},
  };
};
