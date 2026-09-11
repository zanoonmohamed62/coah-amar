/**
 * PM2 Ecosystem Config — amar-site VPS production
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start
 *   pm2 reload ecosystem.config.js         # zero-downtime reload
 *   pm2 save                               # persist across reboots
 *   pm2 startup                            # enable auto-start on reboot
 */
module.exports = {
  apps: [
    {
      name: "amar-site",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/amar-site",          // ← change to your actual deploy path on VPS
      instances: 1,                        // 1 instance (scale to 2+ if you have >2 CPU cores)
      exec_mode: "fork",                   // use "cluster" only if instances > 1
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",          // restart if Node.js exceeds 512 MB RAM
      node_args: "--max-old-space-size=512",  // cap V8 heap at 512 MB
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Log paths (PM2 writes here by default, adjust if needed)
      out_file: "/var/log/pm2/amar-site-out.log",
      error_file: "/var/log/pm2/amar-site-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // Graceful shutdown — give Next.js time to finish in-flight requests
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Restart policy: exponential backoff to avoid crash loops
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },
    {
      // Twice-daily training reminder push. Not a server: PM2 launches the
      // script at each cron tick, it makes one request to the site, and exits.
      // autorestart:false is what stops PM2 relaunching it in a loop.
      // Times are Africa/Cairo (10:00 and 19:00).
      name: "amar-reminders",
      script: "scripts/send-reminders.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: false,
      watch: false,
      cron_restart: "0 10,19 * * *",
      time: true,
      env: {
        NODE_ENV: "production",
        TZ: "Africa/Cairo",
      },
    },
  ],
};
