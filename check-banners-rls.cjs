const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBannerUpdate() {
  console.log('🔍 Testando atualização de banner...\n');

  try {
    // 1. Fazer login como admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'enoquesanbor@gmail.com',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Erro ao fazer login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log(`👤 Usuário: ${authData.user.email}`);
    console.log(`🔑 Role: ${authData.user.role || 'não definido'}\n`);

    // 2. Tentar buscar um banner
    console.log('📖 Tentando ler banners...');
    const { data: readData, error: readError } = await supabase
      .from('dynamic_banners')
      .select('*')
      .eq('id', 1)
      .single();

    if (readError) {
      console.error('❌ Erro ao ler banner:', {
        code: readError.code,
        message: readError.message,
        details: readError.details
      });
    } else {
      console.log('✅ Banner lido com sucesso:', readData.title);
    }

    // 3. Tentar atualizar o banner
    console.log('\n✏️ Tentando atualizar banner...');
    const updateData = {
      title: 'Teste de Atualização',
      description: 'Testando atualização via script',
      updated_at: new Date().toISOString()
    };

    const { data: updateResult, error: updateError } = await supabase
      .from('dynamic_banners')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar banner:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });

      // Verificar tipo de erro
      if (updateError.code === '42501') {
        console.log('\n⚠️ ERRO DE PERMISSÃO (RLS)');
        console.log('   As políticas RLS estão bloqueando a atualização');
        console.log('   Verifique se o usuário tem role "admin" no banco');
      } else if (updateError.code === 'PGRST116') {
        console.log('\n⚠️ ERRO 406 - Tabela não encontrada ou sem permissão');
      }
    } else {
      console.log('✅ Banner atualizado com sucesso!');
      console.log('   Novo título:', updateResult.title);
    }

    // 4. Verificar as políticas RLS
    console.log('\n🔐 Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies', {
      table_name: 'dynamic_banners'
    }).catch(() => ({ data: null, error: { message: 'RPC não disponível' } }));

    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas RLS automaticamente');
      console.log('   Verifique manualmente no Supabase Dashboard');
    } else if (policies) {
      console.log('📋 Políticas encontradas:', policies);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testBannerUpdate();
