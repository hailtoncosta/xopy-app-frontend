const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// UUID do admin (você precisa substituir pelo UUID real do admin)
const ADMIN_USER_ID = 'SEU_UUID_ADMIN_AQUI';

async function createRealProductsFromDynamic() {
  try {
    console.log('🔧 Criando produtos reais para produtos em dynamic_products...\n');

    // Verificar se o admin UUID foi configurado
    if (ADMIN_USER_ID === 'SEU_UUID_ADMIN_AQUI') {
      console.error('❌ ERRO: Configure o ADMIN_USER_ID no script primeiro!');
      console.log('\n💡 Para obter o UUID do admin:');
      console.log('   1. Acesse o Supabase Dashboard');
      console.log('   2. Vá em Authentication > Users');
      console.log('   3. Copie o UUID do usuário admin');
      console.log('   4. Substitua "SEU_UUID_ADMIN_AQUI" no script\n');
      return;
    }

    // Buscar produtos sem source_product_id
    const { data: dynamicProducts, error: dynamicError } = await supabase
      .from('dynamic_products')
      .select('*')
      .is('source_product_id', null)
      .eq('is_active', true);

    if (dynamicError) {
      console.error('❌ Erro ao buscar dynamic_products:', dynamicError);
      return;
    }

    if (!dynamicProducts || dynamicProducts.length === 0) {
      console.log('✅ Todos os produtos já têm source_product_id!');
      return;
    }

    console.log(`📦 Encontrados ${dynamicProducts.length} produtos para processar\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const dp of dynamicProducts) {
      try {
        console.log(`\n🔄 Processando: ${dp.name} (ID: ${dp.id})`);

        // Extrair preço numérico
        let price = 0;
        if (typeof dp.price === 'string') {
          const cleanPrice = dp.price
            .replace(/R\$\s?/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/[^\d.]/g, '');
          price = parseFloat(cleanPrice) || 0;
        } else {
          price = dp.price || 0;
        }

        if (price <= 0) {
          console.log(`   ⚠️ Preço inválido: ${dp.price}, pulando...`);
          errorCount++;
          continue;
        }

        // Criar produto real
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            user_id: ADMIN_USER_ID,
            title: dp.name,
            description: dp.description || 'Produto de alta qualidade para sua obra.',
            category: dp.category || 'Geral',
            price: price,
            quantity: 100, // Quantidade padrão
            seller_type: 'business',
            product_type: 'new',
            seller_info: {
              name: 'Construções Silva',
              businessName: 'Construções Silva',
              phone: '(11) 99999-9999',
              address: 'São Paulo, SP'
            },
            status: 'active',
            approval_status: 'approved'
          })
          .select()
          .single();

        if (insertError) {
          console.log(`   ❌ Erro ao criar produto: ${insertError.message}`);
          errorCount++;
          continue;
        }

        console.log(`   ✅ Produto criado com UUID: ${newProduct.id}`);

        // Atualizar dynamic_products com source_product_id
        const { error: updateError } = await supabase
          .from('dynamic_products')
          .update({ source_product_id: newProduct.id })
          .eq('id', dp.id);

        if (updateError) {
          console.log(`   ⚠️ Erro ao atualizar source_product_id: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ source_product_id atualizado!`);
          successCount++;
        }

        // Aguardar um pouco para não sobrecarregar o banco
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`   ❌ Erro ao processar produto: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO:');
    console.log(`   ✅ Sucesso: ${successCount} produtos`);
    console.log(`   ❌ Erros: ${errorCount} produtos`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 Produtos criados com sucesso!');
      console.log('   Agora os usuários podem comprar esses produtos.\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar apenas se confirmado
console.log('⚠️  ATENÇÃO: Este script irá criar produtos reais no banco de dados!');
console.log('   Certifique-se de ter configurado o ADMIN_USER_ID corretamente.\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  createRealProductsFromDynamic();
} else {
  console.log('💡 Para executar, use: node create-real-products-from-dynamic.cjs --confirm\n');
}
