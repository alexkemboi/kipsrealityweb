#!/bin/bash
echo "🚀 Starting KipsReality Deployment..."

cd /home/kipsreality/kipsrealityweb || exit

echo " Pulling latest changes from GitHub..."
git pull origin main

echo " Installing dependencies..."
npm install --production

echo "Running database migrations..."
npm run db:migrate

echo " Building project..."
npm run build

echo " Restarting app..."
pm2 restart kipsrealityweb || pm2 start npm --name "kipsrealityweb" -- start

echo "✅ ✅ Deployment complete!"

echo "📊 Application status:"
pm2 status

