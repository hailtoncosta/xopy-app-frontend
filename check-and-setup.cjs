require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSetup() {
  try {
    console.log('🔍 Verificando se as tabelas dinâmicas existem...');
    
    // Verificar se a tabela dynamic_products existe
    const { data: products, error: productsError } = await supabase
      .from('dynamic_products')
      .select('count')
      .limit(1);
    
    if (productsError) {
      console.log('❌ Tabelas dinâmicas não encontradas!');
      console.log('📋 Para resolver o problema, siga estes passos:');
      console.log('');
      console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
      console.log('2. Vá para seu projeto: ' + process.env.VITE_SUPABASE_PROJECT_ID);
      console.log('3. Clique em "SQL Editor" no menu lateral');
      console.log('4. Cole e execute o conteúdo do arquivo: create-dynamic-content-tables.sql');
      console.log('');
      console.log('📄 Conteúdo do arquivo SQL:');
      console.log('─'.repeat(80));
      
      const sqlContent = fs.readFileSync('create-dynamic-content-tables.sql', 'utf8');
      console.log(sqlContent);
      console.log('─'.repeat(80));
      console.log('');
      console.log('5. Após executar o SQL, execute este script novamente');
      console.log('');
      console.log('💡 Alternativamente, você pode copiar o SQL acima e executar diretamente no painel');
      return;
    }
    
    // Verificar se há dados nas tabelas
    const { data: productCount } = await supabase
      .from('dynamic_products')
      .select('*', { count: 'exact', head: true });
    
    const { data: bannerCount } = await supabase
      .from('dynamic_banners')
      .select('*', { count: 'exact', head: true });
    
    console.log('✅ Tabelas dinâmicas encontradas!');
    console.log(`📦 Produtos: ${productCount?.length || 0}`);
    console.log(`🖼️  Banners: ${bannerCount?.length || 0}`);
    
    if ((productCount?.length || 0) === 0) {
      console.log('');
      console.log('⚠️  As tabelas existem mas estão vazias.');
      console.log('💡 Os dados iniciais devem ter sido inseridos automaticamente.');
      console.log('🔄 Verifique se o SQL foi executado completamente no painel do Supabase.');
      console.log('');
      console.log('📋 Para inserir dados manualmente, execute estas consultas no SQL Editor:');
      console.log('');
      console.log('-- Inserir produtos básicos');
      console.log(`INSERT INTO dynamic_products (name, price, image_url, type, category, rating, product_group, order_index) VALUES`);
      console.log(`('Cimento CP-II 50kg', 'R$ 24,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, 'featured', 1),`);
      console.log(`('Tinta Acrílica 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, 'paint', 1),`);
      console.log(`('Tijolo Baiano 6 Furos', 'R$ 0,85', '/src/assets/produto-tijolo.jpg', 'produto', 'Material', 4.6, 'essential', 1);`);
      console.log('');
    } else {
      console.log('✅ Dados encontrados nas tabelas!');
      console.log('🎉 A página Home deve estar funcionando corretamente agora!');
      console.log('');
      console.log('🔄 Se ainda não estiver vendo os dados, tente:');
      console.log('1. Recarregar a página (F5)');
      console.log('2. Limpar o cache do navegador (Ctrl+Shift+R)');
      console.log('3. Verificar o console do navegador para erros');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  }
}

checkAndSetup();