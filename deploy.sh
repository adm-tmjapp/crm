#!/bin/bash

set -euo pipefail

echo "🔨 Instalando dependências..."
npm ci

echo "🔨 Gerando build estático do Next.js..."
npm run build

echo "☁️ Enviando arquivos para o S3..."
aws s3 sync ./out s3://tmjapp.com.br --delete

echo "♻️ Invalidando cache do CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id E32NF46OJJ1F5I \
  --paths "/*"

echo "✅ Deploy finalizado com sucesso!"
