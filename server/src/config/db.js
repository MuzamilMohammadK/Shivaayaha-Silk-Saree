import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB_PATH env var allows deploying to a persistent disk (e.g. Railway volumes)
const dbFilePath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../../shivaayaha.sqlite');

let dbInstance = null;

// Save SQLite database binary buffer to disk
export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

// Initialize Database and tables
export async function initDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Initialize Tables
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255) DEFAULT NULL,
      reset_token_expires_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      market_hub VARCHAR(255),
      historic_opening_balance INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      party_id INTEGER NOT NULL,
      bill_number VARCHAR(100) NOT NULL,
      bill_date DATE NOT NULL,
      description TEXT,
      gross_amount INTEGER NOT NULL,
      advance_paid INTEGER DEFAULT 0,
      balance_due INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      party_id INTEGER NOT NULL,
      invoice_id INTEGER DEFAULT NULL,
      type VARCHAR(20) NOT NULL,
      amount INTEGER NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      reference_number VARCHAR(150),
      slip_notes TEXT,
      transaction_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
    );
  `);

  saveDb();
  console.log('✓ SQLite Database initialized successfully with schema at:', dbFilePath);
  return dbInstance;
}

// Helper: Query all matching rows as an array of JavaScript objects
export function query(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: Query single row as an object
export function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

let inTransaction = false;

// Helper: Run an INSERT, UPDATE, or DELETE query and auto-persist to disk
export function run(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  const result = dbInstance.exec("SELECT last_insert_rowid() as id, changes() as changes");
  const lastInsertRowid = result[0]?.values[0]?.[0] ?? null;
  const changes = result[0]?.values[0]?.[1] ?? 0;
  if (!inTransaction) {
    saveDb();
  }
  return { lastInsertRowid, changes };
}

// Helper: Execute in atomic transaction
export function transaction(callback) {
  if (!dbInstance) throw new Error('Database not initialized');
  inTransaction = true;
  dbInstance.run('BEGIN TRANSACTION;');
  try {
    const result = callback();
    dbInstance.run('COMMIT;');
    inTransaction = false;
    saveDb();
    return result;
  } catch (error) {
    console.error('Transaction failed with error:', error);
    try {
      dbInstance.run('ROLLBACK;');
    } catch (rbErr) {}
    inTransaction = false;
    throw error;
  }
}
