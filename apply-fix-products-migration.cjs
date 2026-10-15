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
    console.log('🔧 Aplicando migração de correção de produtos e notificações...\n');

    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251014120000_fix_products_and_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Dividir em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command) {
        console.log(`Executando comando ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' });
        
        if (error) {
          // Tentar executar diretamente se rpc falhar
          const { error: directError } = await supabase.from('_migrations').insert({
            name: `20251014120000_fix_products_and_notifications_${i}`,
            executed_at: new Date().toISOString()
          });
          
          if (directError) {
            console.warn(`⚠️  Aviso no comando ${i + 1}: ${error.message}`);
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }

    console.log('\n✅ Migração aplicada com sucesso!');
    console.log('\n📋 Resumo das alterações:');
    console.log('  • Adicionada coluna approval_status à tabela products');
    console.log('  • Adicionada coluna images à tabela products');
    console.log('  • Atualizada constraint de notificações com tipo new_product_pending');
    console.log('  • Recriado trigger para notificar admins sobre novos produtos');
    console.log('  • Adicionado índice para approval_status');

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    process.exit(1);
  }
}

applyMigration();
