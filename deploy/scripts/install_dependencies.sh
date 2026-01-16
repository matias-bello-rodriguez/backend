#!/bin/bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs nginx

# Install PM2 globally
sudo npm install -g pm2

# Ensure proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/autobox-backend
