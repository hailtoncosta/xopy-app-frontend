require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY estão definidas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function showManualInstructions(filePath) {
  try {
    console.log(`📄 Lendo arquivo: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n⚠️  ATENÇÃO: Criação manual de tabelas necessária!');
    console.log('A chave pública do Supabase não tem permissões para criar tabelas.');
    console.log('\n📋 INSTRUÇÕES PARA CRIAR AS TABELAS MANUALMENTE:');
    console.log('\n1. Acesse o Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
    console.log('\n2. Cole e execute o seguinte SQL:');
    console.log('\n' + '='.repeat(80));
    console.log(sqlContent);
    console.log('='.repeat(80));
    console.log('\n3. Após executar, verifique se as tabelas foram criadas em:');
    console.log('   Database > Tables');
    console.log('\n4. As tabelas necessárias são:');
    console.log('   - dynamic_banners');
    console.log('   - dynamic_categories');
    console.log('   - dynamic_products');
    console.log('   - dynamic_news_banners');
    console.log('   - service_providers');
    
  } catch (error) {
    console.error('❌ Erro ao ler arquivo SQL:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Instruções para criar tabelas dinâmicas no Supabase...');
    
    const sqlFile = path.join(__dirname, 'create-dynamic-content-tables.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Arquivo não encontrado: ${sqlFile}`);
      process.exit(1);
    }
    
    await showManualInstructions(sqlFile);
    
    console.log('\n✅ Após criar as tabelas, reinicie o servidor de desenvolvimento.');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

main();