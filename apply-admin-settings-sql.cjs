require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAdminSettingsSQL() {
  try {
    console.log('🚀 Criando tabela admin_settings no Supabase...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('create-admin-settings-table.sql', 'utf8');
    
    // Executar o SQL diretamente
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Fallback: mostrar instruções manuais
      console.log('\n📋 INSTRUÇÕES MANUAIS:');
      console.log('=' .repeat(60));
      console.log('\n1. Acesse: https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
      console.log('2. Cole e execute o SQL do arquivo create-admin-settings-table.sql');
      console.log('\n' + '=' .repeat(60));
      return;
    }

    console.log('✅ Tabela admin_settings criada com sucesso!');
    console.log('✅ Configurações padrão inseridas!');
    console.log('\n🔄 Agora você pode acessar as configurações de aparência sem erros.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Fallback: mostrar instruções manuais
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('=' .repeat(60));
    console.log('\n1. Acesse: https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
    console.log('2. Cole e execute o SQL do arquivo create-admin-settings-table.sql');
    console.log('\n' + '=' .repeat(60));
  }
}

applyAdminSettingsSQL();