const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdminUser(email) {
  try {
    if (!email) {
      console.error('❌ Erro: Email é obrigatório');
      console.log('Uso: node add-admin-user.cjs email@exemplo.com');
      process.exit(1);
    }

    console.log(`🔍 Procurando usuário com email: ${email}...\n`);

    // Buscar usuário pelo email
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error(`❌ Usuário não encontrado: ${email}`);
      console.log('\n💡 O usuário precisa estar cadastrado no sistema primeiro.');
      return;
    }

    console.log(`✅ Usuário encontrado:`);
    console.log(`   Nome: ${profile.full_name || 'Não informado'}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   ID: ${profile.id}\n`);

    // Verificar se já é admin
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id)
      .eq('role', 'admin')
      .single();

    if (existingRole) {
      console.log('⚠️  Este usuário já é administrador!');
      return;
    }

    // Adicionar role de admin
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profile.id,
        role: 'admin'
      });

    if (insertError) {
      console.error('❌ Erro ao adicionar role de admin:', insertError.message);
      return;
    }

    console.log('✅ Role de admin adicionada com sucesso!');
    console.log(`\n🎉 ${profile.email} agora é administrador do sistema!\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Pegar email dos argumentos da linha de comando
const email = process.argv[2];
addAdminUser(email);
