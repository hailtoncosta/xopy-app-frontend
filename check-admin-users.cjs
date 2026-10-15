const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUsers() {
  try {
    console.log('🔍 Verificando usuários administradores...\n');

    // Buscar todos os usuários com role admin
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, granted_at')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError.message);
      return;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log('⚠️  Nenhum usuário admin encontrado na tabela user_roles\n');
      console.log('📋 Usuários admin definidos no código:');
      console.log('  • admin@pedreiro.com');
      console.log('  • enoquesanbor@gmail.com');
      console.log('  • admin@example.com');
      console.log('\n💡 Execute a migração para criar os admins automaticamente.');
      return;
    }

    console.log(`✅ Encontrados ${adminRoles.length} administrador(es):\n`);

    // Para cada admin, buscar informações do usuário
    for (const adminRole of adminRoles) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, user_type')
        .eq('id', adminRole.user_id)
        .single();

      if (profileError) {
        console.log(`❌ Erro ao buscar perfil do admin ${adminRole.user_id}`);
        continue;
      }

      console.log('👤 Admin:');
      console.log(`   Email: ${profile.email}`);
      console.log(`   Nome: ${profile.full_name || 'Não informado'}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Tipo: ${profile.user_type || 'Não informado'}`);
      console.log(`   Admin desde: ${new Date(adminRole.granted_at).toLocaleString('pt-BR')}`);
      console.log('');
    }

    console.log('📋 Para adicionar um novo admin, execute:');
    console.log('   node add-admin-user.cjs email@exemplo.com\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkAdminUsers();
