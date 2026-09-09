import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import partyRoutes from './routes/partyRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for web frontend & mobile apps (Capacitor localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Shivaayaha Silk Sarees Ledger API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server after Database Initialization
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Shivaayaha Silk Sarees - Manual Ledger Ledger Engine  `);
      console.log(`  Server listening on http://localhost:${PORT}        `);
      console.log(`  Health check: http://localhost:${PORT}/api/health   `);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal database startup error:', error);
    process.exit(1);
  }
}

startServer();
