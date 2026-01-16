#!/bin/bash
cd /home/ubuntu/autobox-backend

# Install dependencies
npm ci

# Build the application
npm run build

# Start or Restart application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
