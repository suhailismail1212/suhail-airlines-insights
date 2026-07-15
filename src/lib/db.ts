import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export const DB_PATH = path.join(process.cwd(), "data", "mock.db");

export function databaseExists(): boolean {
  return fs.existsSync(DB_PATH);
}

let readonlyDb: Database.Database | null = null;

/**
 * The app only ever reads the mock dataset. Opening readonly lets this work
 * on read-only deployment filesystems (e.g. Vercel's lambda bundle), since
 * the db file is generated at build time by scripts/seed.ts, not at runtime.
 */
export function getDb(): Database.Database {
  if (readonlyDb) return readonlyDb;
  if (!databaseExists()) {
    throw new Error(
      `Mock database not found at ${DB_PATH}. Run "npm run seed" first.`
    );
  }
  readonlyDb = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  readonlyDb.pragma("journal_mode = WAL");
  return readonlyDb;
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL REFERENCES visitors(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  total_duration_minutes INTEGER NOT NULL,
  flow TEXT NOT NULL,
  entry_zone_id INTEGER NOT NULL REFERENCES zones(id),
  exit_zone_id INTEGER NOT NULL REFERENCES zones(id),
  primary_zone_id INTEGER NOT NULL REFERENCES zones(id),
  happiness_score REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS zone_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL REFERENCES visits(id),
  zone_id INTEGER NOT NULL REFERENCES zones(id),
  sequence_index INTEGER NOT NULL,
  enter_time TEXT NOT NULL,
  exit_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  happiness_score REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_zone_visits_visit ON zone_visits(visit_id);
CREATE INDEX IF NOT EXISTS idx_zone_visits_zone ON zone_visits(zone_id);
`;
