#!/usr/bin/env bash
# deploy.sh — pull latest code and restart the app on your VPS
# Run this on the VPS: bash deploy.sh
set -e

APP_DIR="/var/www/amar-site"   # ← change to your actual deploy path

echo "==> Navigating to app directory..."
cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
npm ci --omit=dev

echo "==> Generating Prisma client..."
npx prisma generate

echo "==> Syncing database schema..."
npx prisma db push

echo "==> Building Next.js..."
npm run build

echo "==> Reloading PM2 (zero-downtime)..."
pm2 reload ecosystem.config.js --update-env

echo "==> Saving PM2 process list..."
pm2 save

echo ""
echo "✅ Deploy complete. App is live."
pm2 status
