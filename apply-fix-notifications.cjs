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
    console.log('🔧 Aplicando correção do sistema de notificações de produtos...\n');

    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251014130000_fix_product_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executando SQL...\n');
    console.log(migrationSQL);
    console.log('\n---\n');

    // Tentar executar o SQL completo
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });
    
    if (error) {
      console.warn('⚠️  Método RPC não disponível, tentando abordagem alternativa...');
      console.log('\n📋 Por favor, copie o SQL acima e execute manualmente no Supabase Dashboard:');
      console.log('1. Acesse https://supabase.com/dashboard');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá em SQL Editor');
      console.log('4. Cole o SQL e execute\n');
    } else {
      console.log('✅ Migração aplicada com sucesso!\n');
    }

    console.log('📋 Resumo das alterações:');
    console.log('  ✅ Trigger corrigido: admins não recebem notificação dos próprios produtos');
    console.log('  ✅ Novo trigger: vendedor recebe notificação quando produto é aprovado');
    console.log('  ✅ Novo trigger: vendedor recebe notificação quando produto é rejeitado');
    console.log('\n🎯 Fluxo correto:');
    console.log('  1. Vendedor cadastra → Apenas admins recebem "aguardando aprovação"');
    console.log('  2. Admin aprova → Vendedor recebe "✅ Produto aprovado!"');
    console.log('  3. Admin rejeita → Vendedor recebe "❌ Produto não aprovado"');

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    console.log('\n📋 Execute manualmente o SQL do arquivo:');
    console.log('supabase/migrations/20251014130000_fix_product_notifications.sql');
    process.exit(1);
  }
}

applyMigration();
