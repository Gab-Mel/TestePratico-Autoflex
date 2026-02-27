export const allowedTables = ["products", "materials"] as const;
export type TableName = typeof allowedTables[number];
