#!/bin/bash

# Script para gerar ícones PWA do Xopy

echo "🎨 Gerando ícones PWA para o Xopy..."
echo ""

# Criar pasta de ícones
mkdir -p public/icons

# Gerar ícones usando PWA Asset Generator
npx @vite-pwa/assets-generator --preset minimal public/logo.png public/icons

echo ""
echo "✨ Ícones gerados com sucesso em public/icons/"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique os ícones gerados em public/icons/"
echo "2. Gere os ícones de atalhos (shortcuts) manualmente ou use uma ferramenta online"
echo "3. Tire screenshots do app (1080x1920px) e salve em public/screenshots/"
