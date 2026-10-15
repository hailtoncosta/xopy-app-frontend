const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔧 Aplicando correção de tipos de notificação...\n');

    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260106140000_fix_notification_types_constraint.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executando SQL...\n');
    console.log(migrationSQL);
    console.log('\n---\n');

    // Tentar executar o SQL completo
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });
    
    if (error) {
      console.warn('⚠️  Método RPC exec_sql não disponível ou falhou:', error.message);
      console.warn('Tentando executar via SQL Editor seria o ideal, mas vamos tentar via query direta se possível (apenas se policy permitir, o que é improvável para DDL).');
      
      console.log('\n📋 Por favor, copie o SQL acima e execute manualmente no Supabase Dashboard:');
      console.log('1. Acesse https://supabase.com/dashboard');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá em SQL Editor');
      console.log('4. Cole o SQL e execute\n');
    } else {
      console.log('✅ Migração aplicada com sucesso!\n');
    }

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    process.exit(1);
  }
}

applyMigration();
