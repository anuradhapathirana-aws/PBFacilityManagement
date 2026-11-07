#!/usr/bin/env bash
# Update the live site after pushing changes to GitHub.
# Run on the VPS from anywhere:  bash /var/www/planbfm/deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Building website"
npm run build

echo "==> Applying database migrations"
npm run db:deploy

echo "==> Restarting app"
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save

echo "==> Done. Check: pm2 status  |  pm2 logs planbfm --lines 50"
