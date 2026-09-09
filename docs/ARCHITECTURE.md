# Shivaayaha Silk Sarees — Technical Architecture & Engineering Documentation

## 1. System Philosophy: 100% Manual Bookkeeping
Shivaayaha Silk Sarees is engineered specifically for Indian silk saree wholesale and retail business operations. Unlike standard SaaS billing tools:
- **No Third-Party Gateways**: No Razorpay, Stripe, or webhooks.
- **Accurate Offline/Manual Entry**: Reflects cash, manual UPI transfers, cheques, and NEFT payments.
- **Paise Precision Arithmetic**: In the database, all currency values are stored as integers representing paise ($1\text{ INR} = 100\text{ paise}$). This avoids floating-point inaccuracies when calculating cumulative ledger balances.

---

## 2. Monorepo Organization

```
shivaayaha-silk-sarees/
├── package.json               # Root npm workspace & task runner scripts
├── .env.example               # Unified environment variable documentation
├── README.md                  # Project overview, quickstart & feature summary
├── docs/                      # Central technical & user documentation
│   ├── ARCHITECTURE.md        # Technical architecture, schema & ledger formulas
│   ├── RECORD_PAYMENT_GUIDE.md# End-user workflow guide for manual payment vouchers
│   └── RECORD_PAYMENT_USES.txt# Plain-text quick reference for shop staff
│
├── client/                    # React 18 + Vite + Tailwind CSS Single-Page App
│   ├── public/
│   │   ├── manifest.json      # PWA installation manifest
│   │   ├── sw.js              # Offline service worker cache
│   │   └── logo.jpg           # Shivaayaha Silk luxury brand artwork
│   ├── src/
│   │   ├── components/        # Reusable UI widgets & modal dialogs
│   │   │   ├── BillModal.jsx
│   │   │   ├── DashboardChart.jsx  # SVG Donut & Bar chart analytics
│   │   │   ├── MobileNav.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PartyModal.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PwaInstallBanner.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/           # React Context providers (AuthContext, ToastContext)
│   │   ├── pages/             # Route-level views (Dashboard, Parties, Ledger, Invoices)
│   │   ├── services/          # Modular Axios API service abstractions
│   │   └── utils/             # Formatters (Indian Rupee formatting & Dates)
│   ├── capacitor.config.json  # Android Capacitor native app configuration
│   ├── tailwind.config.js     # Silk palette (Maroon, Gold, Cream, Stone)
│   └── vite.config.js         # Vite bundler & backend proxy config
│
└── server/                    # Node.js Express REST API backend
    ├── schema.sql             # Relational schema (SQLite & PostgreSQL compatible)
    ├── test_khata_engine.js   # Automated integration tests for ledger engine
    └── src/
        ├── config/
        │   └── db.js          # SQLite persistence & database operations
        ├── controllers/       # HTTP request handlers
        ├── middleware/        # JWT auth verification
        ├── routes/            # Express router modules
        ├── utils/             # Currency conversions (Rupee <-> Paise)
        └── server.js          # Server entrypoint and CORS configuration
```

---

## 3. Financial Calculation Model (Ledger Engine)

### Variables Stored in Paise
- `historic_opening_balance`: Initial brought-forward debt from old physical diaries.
- `gross_amount`: Total value of purchased saree lot.
- `advance_paid`: Cash paid immediately upon receiving the bill.
- `balance_due`: Unsettled amount on a specific invoice ($Gross - Advance - Repayments$).
- `amount` (Transactions): Amount paid in a voucher repayment.

### Core Mathematical Invariants
1. **Invoice Balance**:
   $$\text{Balance Due} = \max\left(0, \text{Gross Amount} - \text{Advance Paid} - \sum \text{Allocated Voucher Credits}\right)$$

2. **Party Running Net Balance**:
   $$\text{Current Net Balance (Due)} = \text{Opening Balance} + \sum \text{Gross Invoices} - \sum \text{Advance Payments} - \sum \text{Vouchers}$$

3. **Dashboard Aggregate Paid & Due**:
   $$\text{Total Paid} = \sum \text{Advance Payments} + \sum \text{Voucher Credits}$$
   $$\text{Total Outstanding Due} = \max\left(0, \sum \text{Opening Balances} + \sum \text{Gross Invoices} - \text{Total Paid}\right)$$

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new shop owner account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/dashboard/overview` | Aggregated totals, chart data & recent entries | Yes |
| `GET` | `/api/parties` | List all registered weavers and wholesale parties | Yes |
| `POST` | `/api/parties` | Add a new weaver with opening balance | Yes |
| `GET` | `/api/parties/:id/ledger`| Chronological running balance sheet for party | Yes |
| `GET` | `/api/invoices` | List all saree purchase lots and filter by status | Yes |
| `POST` | `/api/invoices` | Create lot invoice with optional advance payment | Yes |
| `GET` | `/api/transactions` | List all payment vouchers and download receipts | Yes |
| `POST` | `/api/transactions` | Post repayment voucher with mode & reference | Yes |
