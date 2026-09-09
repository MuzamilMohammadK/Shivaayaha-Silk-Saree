-- Shivaayaha Silk Sarees (Manual Ledger Ledger)
-- Complete Database Schema for PostgreSQL and SQLite

-- 1. Users / Shop Owners
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parties / Weavers & Wholesale Shops Directory
CREATE TABLE IF NOT EXISTS parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    market_hub VARCHAR(255), -- e.g., 'Dharmavaram', 'Kanchipuram', 'Banaras', 'Surat'
    historic_opening_balance INTEGER DEFAULT 0, -- Stored in paise (e.g. ₹10,000 = 1000000 paise)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Manual Purchase Lot / Bill Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    party_id INTEGER NOT NULL,
    bill_number VARCHAR(100) NOT NULL, -- Shop lot number / physical bill no.
    bill_date DATE NOT NULL,
    description TEXT, -- e.g., 'Dharmavaram pattu 10 pcs wedding lot'
    gross_amount INTEGER NOT NULL, -- Stored in paise (e.g. ₹1,50,000 = 15000000)
    advance_paid INTEGER DEFAULT 0, -- Stored in paise (e.g. ₹70,000 = 7000000)
    balance_due INTEGER NOT NULL, -- Stored in paise (e.g. ₹80,000 = 8000000)
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- 'PAID', 'PARTIAL', 'UNPAID'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
);

-- 4. Manual Vouchers & Repayment Entries (Ledger Paid & Due)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    party_id INTEGER NOT NULL,
    invoice_id INTEGER DEFAULT NULL, -- Optional: links repayment to a specific bill lot
    type VARCHAR(20) NOT NULL, -- 'CREDIT' (Payment Made to Weaver), 'DEBIT' (Due / Lot Bill or Bill adjustment)
    amount INTEGER NOT NULL, -- Stored in paise
    payment_mode VARCHAR(50) NOT NULL, -- 'CASH', 'MANUAL_UPI', 'CHEQUE', 'BANK_TRANSFER'
    reference_number VARCHAR(150), -- Hand-typed UPI UTR, physical diary voucher no., or Cheque no.
    slip_notes TEXT, -- Rough paper slip details or memo notes
    transaction_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- PostgreSQL Equivalent types:
-- For PostgreSQL deployments, replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `SERIAL PRIMARY KEY`
-- and monetary `INTEGER` paise with `NUMERIC(12, 2)` or keep integer paise for zero-loss precision.
