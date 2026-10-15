const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testando login com usuário de teste...');
  
  const testEmail = 'teste@xopy.com';
  const testPassword = '123456';
  
  try {
    console.log('Tentando fazer login com:', testEmail);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.error('Código do erro:', error.status);
      console.error('Detalhes:', error);
      return;
    }
    
    if (data.user) {
      console.log('✅ Login realizado com sucesso!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
      console.log('Último login:', data.user.last_sign_in_at);
      
      // Verificar se existe perfil
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.log('⚠️  Erro ao buscar perfil:', profileError.message);
      } else {
        console.log('✅ Perfil encontrado:', profile.full_name);
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('✅ Logout realizado');
    } else {
      console.log('❌ Login falhou - nenhum usuário retornado');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Testar conexão com Supabase
async function testConnection() {
  console.log('🌐 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
    } else {
      console.log('✅ Conexão com Supabase OK');
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error.message);
  }
}

async function main() {
  await testConnection();
  console.log('\n' + '='.repeat(50));
  await testLogin();
}

main().catch(console.error);