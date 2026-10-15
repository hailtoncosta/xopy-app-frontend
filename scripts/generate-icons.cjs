// Script para gerar ícones PWA
// Execute com: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Cria um ícone SVG simples para o Xopy
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#1a365d"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">X</text>
  <circle cx="${size * 0.8}" cy="${size * 0.8}" r="${size * 0.05}" fill="#f59e0b"/>
</svg>`;
};

// Salva os ícones SVG
const publicDir = path.join(__dirname, '..', 'public');

// Cria ícones em diferentes tamanhos
const sizes = [192, 512];
sizes.forEach(size => {
  const iconSvg = createIcon(size);
  fs.writeFileSync(path.join(publicDir, `pwa-${size}x${size}.svg`), iconSvg);
});

// Cria o apple-touch-icon
const appleTouchIcon = createIcon(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIcon);

console.log('Ícones PWA gerados com sucesso!');
console.log('Para converter para PNG, use uma ferramenta online ou ImageMagick:');
console.log('convert pwa-192x192.svg pwa-192x192.png');
console.log('convert pwa-512x512.svg pwa-512x512.png');
console.log('convert apple-touch-icon.svg apple-touch-icon.png');