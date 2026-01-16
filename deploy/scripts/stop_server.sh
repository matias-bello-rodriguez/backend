#!/bin/bash
cd /home/ubuntu/autobox-backend
pm2 stop ecosystem.config.js || true
