#!/bin/bash
set -e

echo "🚀 Starting Render deployment..."

# Verificar variables de entorno requeridas
required_vars=("DATABASE_HOST" "DATABASE_PORT" "DATABASE_USER" "DATABASE_PASSWORD" "DATABASE_NAME")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

echo "✅ All required environment variables are set"

# Instalar dependencias
echo "📦 Installing dependencies..."
cd backend
npm ci --only=production

# Build
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
