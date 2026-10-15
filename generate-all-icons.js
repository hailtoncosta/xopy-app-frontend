import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos necessários para o manifest
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório se não existir
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Caminho da imagem base
const basePath = path.join(__dirname, 'public', 'pwa-512x512.png');

async function generateIcons() {
  console.log('🎨 Gerando ícones do Xopy...\n');

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(basePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 234, g: 88, b: 12, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Criado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao criar icon-${size}x${size}.png:`, error.message);
    }
  }

  // Criar ícones de shortcuts
  console.log('\n🎯 Criando ícones de atalhos...\n');
  
  const shortcuts = ['products', 'services', 'offers', 'profile'];
  
  for (const shortcut of shortcuts) {
    const outputPath = path.join(iconsDir, `shortcut-${shortcut}.png`);
    
    try {
      await sharp(basePath)
        .resize(96, 96, {
          fit: 'contain',
          background: { r: 234, g: 88, b: 12, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Criado: shortcut-${shortcut}.png`);
    } catch (error) {
      console.error(`❌ Erro ao criar shortcut-${shortcut}.png:`, error.message);
    }
  }

  console.log('\n✨ Todos os ícones foram gerados com sucesso!');
  console.log(`📁 Localização: ${iconsDir}`);
}

generateIcons().catch(err => {
  console.error('❌ Erro geral:', err);
  process.exit(1);
});
