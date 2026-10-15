const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gpbepsinnvatubokfgvr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVwc2lubnZhdHVib2tmZ3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDUyOTgsImV4cCI6MjA3MjgyMTI5OH0._LzlQjyG23Nrr1-y2ACQBNepzvvvQYXI5gTdNvIJIKM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('Criando usuário de teste...');
  
  const testEmail = 'teste@xopy.com';
  const testPassword = '123456';
  
  try {
    // Primeiro, verificar se o usuário já existe
    console.log('Verificando se usuário já existe...');
    
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (existingUser.user && !checkError) {
      console.log('✅ Usuário de teste já existe e pode fazer login!');
      console.log('Email:', testEmail);
      console.log('Senha:', testPassword);
      
      // Fazer logout
      await supabase.auth.signOut();
      return;
    }
    
    console.log('Usuário não existe, criando novo...');
    
    // Criar novo usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Usuário Teste',
          phone: '(11) 99999-9999',
          type: 'customer'
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ Falha ao criar usuário');
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth!');
    console.log('User ID:', authData.user.id);
    
    // Verificar se precisa confirmar email
    if (!authData.session) {
      console.log('⚠️  Usuário criado mas precisa confirmar email');
      console.log('Para testes, vamos tentar criar o perfil mesmo assim...');
    }

    // Criar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: 'Usuário Teste',
        phone: '(11) 99999-9999',
        user_type: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        is_verified: true // Marcar como verificado para testes
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message);
      console.log('Mas o usuário foi criado no Auth. Detalhes:');
      console.log('Email:', testEmail);
      console.log('Senha:', testPassword);
    } else {
      console.log('✅ Perfil criado com sucesso!');
      console.log('Nome:', profile.full_name);
      console.log('Tipo:', profile.user_type);
    }
    
    console.log('\n🎉 Usuário de teste criado!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Senha:', testPassword);
    console.log('\nVocê pode usar essas credenciais para testar o login.');
    
    // Fazer logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Função para listar usuários existentes
async function listUsers() {
  console.log('Listando usuários existentes...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('\n👥 Usuários encontrados:');
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.email}) - ${profile.user_type}`);
      });
    } else {
      console.log('\n📭 Nenhum usuário encontrado na tabela user_profiles');
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar as funções
async function main() {
  console.log('🔍 Verificando base de dados...');
  await listUsers();
  console.log('\n' + '='.repeat(50));
  await createTestUser();
}

main().catch(console.error);