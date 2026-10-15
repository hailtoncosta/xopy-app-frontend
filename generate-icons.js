const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamanhos necessários para o manifest
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcutSize = 96;

// Criar diretórios se não existirem
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Caminho da logo original
const logoPath = path.join(__dirname, 'public', 'logo.png');

async function generateIcons() {
  console.log('🎨 Gerando ícones do Xopy...\n');

  // Gerar ícones principais
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 234, g: 88, b: 12, alpha: 1 } // #ea580c
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Criado: icon-${size}x${size}.png`);
  }

  // Gerar ícones de atalhos (shortcuts)
  const shortcuts = [
    { name: 'products', icon: '🛒', color: '#ea580c' },
    { name: 'services', icon: '🔧', color: '#ea580c' },
    { name: 'offers', icon: '🏷️', color: '#ea580c' },
    { name: 'profile', icon: '👤', color: '#ea580c' }
  ];

  console.log('\n🎯 Gerando ícones de atalhos...\n');

  for (const shortcut of shortcuts) {
    const outputPath = path.join(iconsDir, `shortcut-${shortcut.name}.png`);
    
    // Criar um ícone simples com fundo laranja
    const svg = `
      <svg width="${shortcutSize}" height="${shortcutSize}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${shortcut.color}" rx="20"/>
        <text x="50%" y="50%" font-size="48" text-anchor="middle" dy=".3em">${shortcut.icon}</text>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Criado: shortcut-${shortcut.name}.png`);
  }

  console.log('\n✨ Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(err => {
  console.error('❌ Erro ao gerar ícones:', err);
  process.exit(1);
});
