const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function fixDynamicProductsSources() {
  try {
    console.log('🔍 Verificando produtos em dynamic_products sem source_product_id...\n');

    // Buscar todos os produtos em dynamic_products
    const { data: dynamicProducts, error: dynamicError } = await supabase
      .from('dynamic_products')
      .select('*')
      .is('source_product_id', null);

    if (dynamicError) {
      console.error('❌ Erro ao buscar dynamic_products:', dynamicError);
      return;
    }

    if (!dynamicProducts || dynamicProducts.length === 0) {
      console.log('✅ Todos os produtos em dynamic_products têm source_product_id!');
      return;
    }

    console.log(`⚠️ Encontrados ${dynamicProducts.length} produtos sem source_product_id:\n`);

    for (const dp of dynamicProducts) {
      console.log(`📦 Produto ID ${dp.id}: ${dp.name}`);
      console.log(`   Categoria: ${dp.category}`);
      console.log(`   Preço: ${dp.price}`);
      console.log(`   ⚠️ Este produto NÃO PODE ser comprado até ter um source_product_id válido\n`);
    }

    console.log('\n⚠️ ATENÇÃO: Produtos em dynamic_products devem ter um source_product_id');
    console.log('   que aponta para um produto real na tabela products.');
    console.log('   Sem isso, o checkout não funcionará.\n');

    console.log('💡 Solução: Criar produtos reais na tabela products para cada produto');
    console.log('   em dynamic_products e atualizar o campo source_product_id.\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixDynamicProductsSources();
