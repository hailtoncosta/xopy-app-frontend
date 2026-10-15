import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testChatFix() {
  try {
    console.log('🧪 Testando se o problema do chat foi resolvido...');
    
    // 1. Verificar user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'service_provider');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar user_profiles:', profilesError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${profiles.length} prestadores em user_profiles:`);
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name} (${profile.email}) - Verificado: ${profile.is_verified}`);
    });
    
    // 2. Verificar service_providers
    const { data: serviceProviders, error: spError } = await supabase
      .from('service_providers')
      .select('*')
      .eq('status', 'approved');
    
    if (spError) {
      console.error('❌ Erro ao buscar service_providers:', spError.message);
      return;
    }
    
    console.log(`\n✅ Encontrados ${serviceProviders.length} prestadores aprovados:`);
    serviceProviders.forEach(sp => {
      console.log(`  - ${sp.name} (${sp.email}) - Status: ${sp.status}`);
    });
    
    // 3. Testar função isServiceProvider
    if (serviceProviders.length > 0) {
      const testUserId = serviceProviders[0].user_id;
      console.log(`\n🔍 Testando isServiceProvider para: ${serviceProviders[0].name}`);
      
      const { data: isProvider, error: isProviderError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', testUserId)
        .eq('status', 'approved')
        .single();
      
      if (isProviderError) {
        console.log('❌ Usuário não é prestador aprovado:', isProviderError.message);
      } else {
        console.log('✅ Usuário é prestador aprovado!');
      }
    }
    
    // 4. Verificar se as tabelas de chat estão acessíveis
    const tables = ['conversations', 'messages', 'notifications'];
    console.log('\n📋 Verificando tabelas de chat:');
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} registros`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Teste concluído! Se todos os itens estão ✅, o problema foi resolvido.');
    console.log('📝 Agora os prestadores de serviços devem conseguir ver e responder mensagens.');
    
  } catch (err) {
    console.error('❌ Erro no teste:', err.message);
  }
}

testChatFix();