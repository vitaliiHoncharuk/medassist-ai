import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

let _db: NeonDatabase<typeof schema> | null = null;

export const getDb = (): NeonDatabase<typeof schema> => {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  _db = drizzle(url, { schema });
  return _db;
};
