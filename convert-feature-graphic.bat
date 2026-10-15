@echo off
REM Script para converter o feature graphic SVG para PNG

echo 🎨 Convertendo feature graphic para PNG...
echo.

REM Opção 1: Usar ImageMagick (se instalado)
where magick >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Usando ImageMagick...
    magick convert -density 300 -background none public/feature-graphic.svg -resize 1024x500 public/feature-graphic.png
    echo ✅ Convertido com ImageMagick!
    goto :end
)

REM Opção 2: Usar Inkscape (se instalado)
where inkscape >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Usando Inkscape...
    inkscape public/feature-graphic.svg --export-filename=public/feature-graphic.png --export-width=1024 --export-height=500
    echo ✅ Convertido com Inkscape!
    goto :end
)

REM Opção 3: Usar Node.js com sharp
echo Tentando converter com Node.js (sharp)...
node -e "const sharp = require('sharp'); sharp('public/feature-graphic.svg').resize(1024, 500).png().toFile('public/feature-graphic.png').then(() => console.log('✅ Convertido com sharp!')).catch(err => console.error('❌ Erro:', err));"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Nenhuma ferramenta de conversão encontrada!
    echo.
    echo 📋 Opções:
    echo 1. Instalar ImageMagick: https://imagemagick.org/script/download.php
    echo 2. Instalar Inkscape: https://inkscape.org/release/
    echo 3. Instalar sharp: npm install sharp
    echo 4. Abrir o SVG no navegador e tirar screenshot
    echo 5. Usar site online: https://cloudconvert.com/svg-to-png
)

:end
echo.
pause
