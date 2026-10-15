import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUserProfiles() {
  try {
    console.log('🔄 Sincronizando user_profiles com service_providers...');
    
    // 1. Buscar todos os prestadores de serviços
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('*');
    
    if (providersError) {
      console.error('❌ Erro ao buscar prestadores:', providersError.message);
      return;
    }
    
    console.log(`📋 Encontrados ${providers.length} prestadores de serviços`);
    
    // 2. Para cada prestador, verificar se existe user_profile
    for (const provider of providers) {
      console.log(`\n🔍 Verificando prestador: ${provider.name} (${provider.user_id})`);
      
      // Verificar se já existe user_profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', provider.user_id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error(`❌ Erro ao verificar profile: ${profileError.message}`);
        continue;
      }
      
      if (existingProfile) {
        console.log(`✅ Profile já existe para ${provider.name}`);
        continue;
      }
      
      // Criar user_profile para o prestador
      console.log(`🆕 Criando profile para ${provider.name}...`);
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: provider.user_id,
          email: provider.email,
          full_name: provider.name,
          phone: provider.phone,
          user_type: 'service_provider',
          is_verified: provider.status === 'approved'
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`❌ Erro ao criar profile: ${createError.message}`);
      } else {
        console.log(`✅ Profile criado com sucesso para ${provider.name}`);
      }
    }
    
    // 3. Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (finalError) {
      console.error('❌ Erro ao verificar profiles finais:', finalError.message);
    } else {
      console.log(`✅ Total de user_profiles: ${finalProfiles.length}`);
      finalProfiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.user_type})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

syncUserProfiles();