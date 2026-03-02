import { getConnection } from "../db";

type HistoryInput = {
  table: string;
  lineId: number;
  column: string;
  oldValue?: any;
  newValue: any;
  responsible: string;
};

export async function registerHistory(data: HistoryInput) {
  const conn = getConnection();

  await conn.execute(
    `
    INSERT INTO edition_table_history
    (table_name, line_id, column_name, old_value, new_value, responsible)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.table,
      data.lineId,
      data.column,
      data.oldValue ?? null,
      String(data.newValue),
      data.responsible,
    ]
  );
}