// PM2 Ecosystem Configuration — Shivaayaha Silk Sarees Backend
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
//
// ⚠️  Environment variables here are DEFAULTS only.
//     On EC2, real secrets are set via:  pm2 set shivaayaha-api:JWT_SECRET <value>
//     Or via a .env file in the server/ directory (preferred).

module.exports = {
  apps: [
    {
      name: 'shivaayaha-api',
      script: 'src/server.js',

      // ESM support (package.json has "type": "module")
      node_args: '--experimental-vm-modules',

      // Number of instances — 1 is fine for SQLite (file-based, no concurrent writes)
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,

      // Memory limit — restart if exceeding 300MB (t2.micro has 1GB RAM)
      max_memory_restart: '300M',

      // Environment — production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Log configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '~/.pm2/logs/shivaayaha-api-error.log',
      out_file: '~/.pm2/logs/shivaayaha-api-out.log',
      merge_logs: true,
    },
  ],
};
