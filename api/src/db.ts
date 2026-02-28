import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(__dirname, "../../db/database.db");
const schemaPath = path.resolve(__dirname, "../../db/schema.sqlite.sql");
const seedPath = path.resolve(__dirname, "../../db/seeds/seed.sql");

const firstRun = !fs.existsSync(dbPath);

const db = new Database(dbPath);

// cria schema automaticamente
if (firstRun) {
    console.log("📦 Creating schema...");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schema);

    console.log("🌱 Running seed...");
    const seed = fs.readFileSync(seedPath, "utf-8");
    db.exec(seed);
}
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
      return { rowsAffected: result.changes,
            lastInsertRowid: result.lastInsertRowid
       };
    },

    close: async () => {},
  };
};
