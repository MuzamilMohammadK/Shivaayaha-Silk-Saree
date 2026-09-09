# Shivaayaha Silk Sarees (Shivaya Silk Sarees)
### Production-Grade Manual Ledger & Paid & Due Ledger Web and Mobile Application

A clean, high-contrast, traditional silk-themed manual bookkeeping system built for wholesale and retail silk saree shops. Tailored for weaver purchase lots, down-payment advances, and cash/manual UPI repayment vouchers.

![Shivaayaha Silk Sarees Brand](client/public/logo.jpg)

---

## CRITICAL SYSTEM ARCHITECTURE: 100% MANUAL DATA ENTRY
- **Zero Payment Gateways or Webhooks:** No Stripe, Razorpay, or automated bank hooks.
- **Pure Digital Ledger / Paid & Due:** Functions purely as an intuitive digital version of the traditional Indian cloth merchant's paper ledger ("Lal Kitab" / Diary).
- **Exact Numeric Accounting:** Stored in integer paise (1 INR = 100 paise) to prevent floating-point rounding errors.

---

## Features

1. **Party / Weaver Directory:**
   - Add/manage weavers and wholesale parties with name, phone, market hub (Dharmavaram, Kanchipuram, Banaras, Surat, etc.), and historic brought-forward opening balance.
2. **Manual Invoice / Purchase Bill Entry:**
   - Form fields: Bill/Lot Number, Bill Date, Notes/Description (e.g., *"Dharmavaram pattu 10 pcs wedding lot"*), Total Gross Amount (e.g., *₹1,50,000*), and Immediate Cash/Advance Paid (e.g., *₹70,000*).
   - Real-time live balance calculation: Auto-computes remaining balance ($₹1,50,000 - ₹70,000 = ₹80,000$ pending) and assigns status (`PAID`, `PARTIAL`, `UNPAID`).
3. **Manual Voucher / Repayment Entries (Paid):**
   - Subsequent repayments with payment modes: `CASH`, `MANUAL_UPI`, `CHEQUE`, `BANK_TRANSFER`.
   - Text field for hand-typed UPI UTR, physical diary voucher no., or cheque number.
   - Atomic database transactions to update invoice balances when manual payments are posted.
4. **Chronological Party Running Ledger:**
   - Complete timeline showing Date, Type, Lot/Ref #, Memo Notes, Debit (Debit), Credit (Credit), and Running Balance.
   - Built-in printable statement for weavers and merchants.
5. **PWA Mobile App Download:**
   - 1-tap "Install App" to download directly to Android home screen without Google Play Store.
   - Service worker offline cache and standalone mobile app window.
6. **Capacitor Native Android Packaging:**
   - Pre-configured Capacitor integration to bundle into a release Android APK.

---

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, Lucide React, React Router 6, Axios, Vite.
- **Backend:** Node.js (v20+), Express, JWT Authentication, bcryptjs password hashing.
- **Database:** SQLite (zero-setup out of the box with persistence) + complete PostgreSQL DDL (`server/schema.sql`).
- **Mobile Engine:** Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) & PWA (Web App Manifest + Service Worker).

---

## Directory Structure

```
madhu/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # SQLite connection, schema bootstrap & persistence
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Forgot Password, Reset Password
│   │   │   ├── partyController.js  # Weaver directory & chronological running ledger
│   │   │   ├── invoiceController.js# Purchase lots & live balance calculations
│   │   │   ├── transactionController.js # Atomic payment vouchers
│   │   │   └── dashboardController.js   # Overall Paid & Due aggregates
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT authentication verification
│   │   ├── routes/                 # Express API endpoints
│   │   ├── utils/
│   │   │   └── currency.js         # Exact paise/rupee arithmetic
│   │   └── server.js               # Express application entrypoint
│   ├── schema.sql                  # PostgreSQL & SQLite DDL
│   ├── package.json
│   └── .env.example
├── client/
│   ├── public/
│   │   ├── manifest.json           # PWA installation manifest
│   │   ├── sw.js                   # PWA service worker
│   │   ├── logo.jpg                # Shivaayaha Silk Sarees luxury brand icon
│   │   └── favicon.svg             # Vector brand icon
│   ├── src/
│   │   ├── components/             # Navbar, MobileNav, Modals, StatCards, Banners
│   │   ├── context/                # AuthContext & ToastContext
│   │   ├── pages/                  # Login, Register, Forgot/Reset, Dashboard, Ledger
│   │   ├── services/               # Axios API callers
│   │   ├── utils/                  # Indian currency & date formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Traditional silk maroon & zari gold styles
│   ├── capacitor.config.json       # Android Capacitor configuration
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
The server will start on `http://localhost:5000` and automatically create the SQLite database `server/shivaayaha.sqlite`.

### 2. Start Frontend Web Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## PWA Mobile Installation (Android / iOS)

The application includes a Progressive Web App (PWA) manifest and Service Worker:
1. Open `http://<your-lan-ip>:5173` (or deployed HTTPS domain) in Chrome or Brave on your Android phone.
2. An automatic **"📱 Shivaayaha Ledger App: Install App"** banner appears at the top.
3. Tap **Install App** (or open browser menu `⋮` -> **Add to Home screen** / **Install app**).
4. The application installs as a standalone native-style mobile app icon on your phone with fullscreen support!

---

## Android APK Packaging via Capacitor

To compile a native Android APK using Android Studio:

### Step 1: Build the React web frontend
```bash
cd client
npm run build
```

### Step 2: Initialize Capacitor Android platform
```bash
npx cap add android
```

### Step 3: Synchronize web assets to Android project
```bash
npx cap sync
```

### Step 4: Open in Android Studio & Generate APK
```bash
npx cap open android
```
Inside Android Studio:
1. Wait for Gradle sync to complete.
2. Select **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. Your installable `app-debug.apk` will be generated in `client/android/app/build/outputs/apk/debug/`.

---

## Git & GitHub Deployment Instructions

To push this project to GitHub cleanly:

```bash
# 1. Initialize git repository in project root
cd /path/to/madhu
git init

# 2. Add all project files (node_modules and sqlite files are ignored by .gitignore)
git add .

# 3. Commit the codebase
git commit -m "feat: initial production release of Shivaayaha Silk Sarees manual ledger"

# 4. Create a repository on GitHub named 'shivaayaha-silk-sarees'
# 5. Link and push to GitHub:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/shivaayaha-silk-sarees.git
git push -u origin main
```
