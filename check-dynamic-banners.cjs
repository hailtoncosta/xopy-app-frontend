const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDynamicBanners() {
  console.log('🔍 Verificando tabela dynamic_banners...\n');

  try {
    // Tentar buscar dados da tabela
    const { data, error } = await supabase
      .from('dynamic_banners')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao acessar dynamic_banners:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        console.log('\n⚠️ A tabela dynamic_banners NÃO EXISTE no banco de dados!');
        console.log('\n📋 Você precisa executar o script de criação das tabelas:');
        console.log('   node apply-dynamic-tables.cjs');
      } else if (error.code === '42501') {
        console.log('\n⚠️ Problema de permissão (RLS)');
        console.log('   As políticas de segurança podem estar bloqueando o acesso');
      }
      
      return false;
    }

    console.log('✅ Tabela dynamic_banners existe!');
    console.log(`📊 Registros encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Primeiros banners:');
      data.forEach((banner, index) => {
        console.log(`\n${index + 1}. ${banner.title}`);
        console.log(`   ID: ${banner.id}`);
        console.log(`   Ativo: ${banner.is_active ? 'Sim' : 'Não'}`);
        console.log(`   Ordem: ${banner.order_index}`);
      });
    } else {
      console.log('\n⚠️ A tabela existe mas está vazia');
      console.log('   Execute: node populate-dynamic-tables.cjs');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    return false;
  }
}

checkDynamicBanners();
