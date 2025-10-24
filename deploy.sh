#!/bin/bash
cd /var/www/kipsrealityweb || exit

echo " Pulling latest changes from GitHub..."
git pull origin main

echo " Installing dependencies..."
npm install --production

echo " Building project..."
npm run build

echo " Restarting app..."
pm2 restart kipsrealityweb || pm2 start npm --name "kipsrealityweb" -- start

echo " Deployment complete!"
