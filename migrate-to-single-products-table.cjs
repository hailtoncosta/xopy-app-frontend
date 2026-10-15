const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// UUID do admin (você precisa substituir pelo UUID real do admin)
const ADMIN_USER_ID = 'SEU_UUID_ADMIN_AQUI';

async function migrateToSingleProductsTable() {
  try {
    console.log('🔄 MIGRAÇÃO: dynamic_products → products\n');
    console.log('📋 Esta migração irá:');
    console.log('   1. Mover todos os produtos de dynamic_products para products');
    console.log('   2. Criar UUIDs reais para cada produto');
    console.log('   3. Manter referência ao ID original em dynamic_products');
    console.log('   4. Permitir que todos os produtos sejam comprados\n');

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

    // Buscar TODOS os produtos em dynamic_products
    const { data: dynamicProducts, error: dynamicError } = await supabase
      .from('dynamic_products')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (dynamicError) {
      console.error('❌ Erro ao buscar dynamic_products:', dynamicError);
      return;
    }

    if (!dynamicProducts || dynamicProducts.length === 0) {
      console.log('⚠️ Nenhum produto encontrado em dynamic_products');
      return;
    }

    console.log(`📦 Encontrados ${dynamicProducts.length} produtos para migrar\n`);
    console.log('=' .repeat(70) + '\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const migrations = [];

    for (const dp of dynamicProducts) {
      try {
        console.log(`🔄 [${dp.id}] ${dp.name}`);

        // Verificar se já tem source_product_id (já foi migrado)
        if (dp.source_product_id) {
          console.log(`   ⏭️  Já migrado (UUID: ${dp.source_product_id.substring(0, 8)}...)`);
          skippedCount++;
          continue;
        }

        // Extrair preço numérico
        let price = 0;
        if (typeof dp.price === 'string') {
          const cleanPrice = dp.price
            .replace(/R\$\s?/g, '')
            .replace(/Por:\s?/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/[^\d.]/g, '')
            .trim();
          price = parseFloat(cleanPrice) || 0;
        } else {
          price = dp.price || 0;
        }

        if (price <= 0) {
          console.log(`   ⚠️  Preço inválido: "${dp.price}" → Usando R$ 0.01`);
          price = 0.01; // Preço mínimo para não bloquear
        }

        // Determinar categoria válida
        const validCategories = [
          'Material de Construção',
          'Ferramentas',
          'Pintura',
          'Elétrica',
          'Hidráulica',
          'Acabamento',
          'Telhas e Coberturas',
          'Decoração',
          'Outros'
        ];

        let category = dp.category || 'Outros';
        if (!validCategories.includes(category)) {
          // Tentar mapear categorias antigas
          const categoryMap = {
            'Material': 'Material de Construção',
            'Tijolos e Blocos': 'Material de Construção',
            'Cimento e Argamassa': 'Material de Construção',
            'Madeiras': 'Material de Construção',
            'Ferragens': 'Ferramentas',
            'Ferramentas Elétricas': 'Ferramentas',
            'Elétrica': 'Elétrica',
            'Geral': 'Outros',
            'Destaque': 'Outros',
            'Teste': 'Outros'
          };
          category = categoryMap[category] || 'Outros';
        }

        // Preparar imagens
        let images = [];
        if (dp.image_url) {
          images = [dp.image_url];
        }

        // Criar produto real em products
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            user_id: ADMIN_USER_ID,
            title: dp.name,
            description: dp.description || `${dp.name} - Produto de alta qualidade para sua obra.`,
            category: category,
            price: price,
            quantity: 999, // Estoque alto para produtos do sistema
            seller_type: 'business',
            product_type: 'new',
            images: images,
            seller_info: {
              name: 'Xopy Marketplace',
              businessName: 'Xopy Marketplace',
              phone: '(11) 99999-9999',
              address: 'São Paulo, SP',
              email: 'vendas@xopy.com.br'
            },
            status: 'active',
            approval_status: 'approved'
          })
          .select()
          .single();

        if (insertError) {
          console.log(`   ❌ Erro: ${insertError.message}`);
          errorCount++;
          continue;
        }

        const newUUID = newProduct.id;
        console.log(`   ✅ Criado: ${newUUID.substring(0, 8)}...`);

        // Atualizar dynamic_products com source_product_id
        const { error: updateError } = await supabase
          .from('dynamic_products')
          .update({ source_product_id: newUUID })
          .eq('id', dp.id);

        if (updateError) {
          console.log(`   ⚠️  Aviso: Não foi possível atualizar source_product_id`);
        } else {
          console.log(`   🔗 Vinculado: dynamic_products[${dp.id}] → products[${newUUID.substring(0, 8)}...]`);
        }

        migrations.push({
          old_id: dp.id,
          new_uuid: newUUID,
          name: dp.name,
          price: price,
          category: category
        });

        successCount++;

        // Aguardar um pouco para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        errorCount++;
      }

      console.log(''); // Linha em branco
    }

    console.log('=' .repeat(70));
    console.log('\n📊 RESUMO DA MIGRAÇÃO:\n');
    console.log(`   ✅ Migrados com sucesso: ${successCount} produtos`);
    console.log(`   ⏭️  Já migrados (pulados): ${skippedCount} produtos`);
    console.log(`   ❌ Erros: ${errorCount} produtos`);
    console.log(`   📦 Total processado: ${dynamicProducts.length} produtos\n`);
    console.log('=' .repeat(70) + '\n');

    if (successCount > 0) {
      console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
      console.log('✅ Agora todos os produtos estão na tabela "products"');
      console.log('✅ Cada produto tem um UUID válido');
      console.log('✅ Os produtos podem ser comprados normalmente');
      console.log('✅ A tabela "dynamic_products" mantém referência via source_product_id\n');
      
      console.log('📋 PRÓXIMOS PASSOS:\n');
      console.log('   1. Teste comprar alguns produtos');
      console.log('   2. Verifique se o checkout funciona');
      console.log('   3. Considere desativar dynamic_products no futuro\n');
      
      // Salvar log da migração
      const logContent = JSON.stringify(migrations, null, 2);
      const fs = require('fs');
      fs.writeFileSync('migration-log.json', logContent);
      console.log('💾 Log da migração salvo em: migration-log.json\n');
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
  }
}

// Executar apenas se confirmado
console.log('⚠️  ATENÇÃO: MIGRAÇÃO DE PRODUTOS\n');
console.log('Este script irá:');
console.log('  • Mover produtos de dynamic_products para products');
console.log('  • Criar UUIDs reais para cada produto');
console.log('  • Manter referências entre as tabelas\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  migrateToSingleProductsTable();
} else {
  console.log('💡 Para executar, use:\n');
  console.log('   node migrate-to-single-products-table.cjs --confirm\n');
}
