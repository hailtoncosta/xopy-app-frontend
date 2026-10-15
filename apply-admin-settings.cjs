const fs = require('fs');

console.log('📋 INSTRUÇÕES PARA CRIAR A TABELA ADMIN_SETTINGS');
console.log('=' .repeat(60));
console.log('\n1. Acesse: https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/sql');
console.log('2. Cole e execute o SQL abaixo:');
console.log('\n' + '=' .repeat(60));

try {
  const sqlContent = fs.readFileSync('create-admin-settings-table.sql', 'utf8');
  console.log(sqlContent);
  console.log('=' .repeat(60));
  console.log('\n✅ Após executar o SQL acima, a tabela admin_settings estará criada!');
  console.log('\n🔄 Continue com a implementação das APIs...');
} catch (error) {
  console.error('❌ Erro ao ler arquivo SQL:', error.message);
}