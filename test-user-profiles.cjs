// Script para testar conexão com user_profiles
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTANDO');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'OK' : 'FALTANDO');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserProfiles() {
  console.log('🔍 Testando conexão com user_profiles...\n');

  try {
    // Testar conexão básica
    const { data: profiles, error: profilesError, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (profilesError) {
      console.error('❌ Erro ao buscar user_profiles:', profilesError.message);
      console.error('Detalhes:', profilesError);
      return;
    }

    console.log('✅ Conexão com user_profiles OK!');
    console.log(`📊 Total de usuários em user_profiles: ${count || profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      console.log('\n👥 Usuários encontrados:');
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.email} - ${profile.full_name || 'Sem nome'} (${profile.user_type})`);
      });
    } else {
      console.log('\n⚠️  Nenhum usuário encontrado em user_profiles!');
      console.log('Isso significa que os usuários não foram sincronizados.');
    }

    // Verificar se a tabela existe e tem as colunas corretas
    console.log('\n🔍 Verificando estrutura da tabela...');
    if (profiles && profiles.length > 0) {
      const firstProfile = profiles[0];
      console.log('Colunas disponíveis:', Object.keys(firstProfile).join(', '));
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testUserProfiles().then(() => {
  console.log('\n✅ Teste concluído!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
