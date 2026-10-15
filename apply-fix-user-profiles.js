import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyFixUserProfiles() {
  try {
    console.log('📋 Gerando SQL para corrigir user_profiles...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-user-profiles.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 COPIE E COLE O SQL ABAIXO NO EDITOR SQL DO SUPABASE:');
    console.log('🔗 https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
    console.log('='.repeat(80));
    console.log();
    console.log(sqlContent);
    console.log();
    console.log('='.repeat(80));
    console.log('✅ Após executar o SQL, os prestadores de serviços poderão ver e responder mensagens!');
    console.log('='.repeat(80));
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

applyFixUserProfiles();