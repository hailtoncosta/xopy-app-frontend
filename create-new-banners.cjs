require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNewBanners() {
  try {
    console.log('🆕 Criando novos banners com URLs corretas...');
    
    // Buscar a imagem mais recente do storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('product-images')
      .list('banners', { limit: 100 });
    
    if (storageError) {
      console.error('❌ Erro ao buscar arquivos:', storageError);
      return;
    }
    
    const latestFile = storageFiles
      .filter(f => f.name.endsWith('.jpg') || f.name.endsWith('.png'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    
    if (!latestFile) {
      console.error('❌ Nenhuma imagem encontrada');
      return;
    }
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(`banners/${latestFile.name}`);
    
    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log(`🖼️ URL da imagem: ${imageUrl}`);
    
    // Criar novos banners com a estrutura correta da tabela
    const newBanners = [
      {
        title: 'Promoção Cimento Nova',
        description: 'Até 30% de desconto em cimentos selecionados - Imagem atualizada!',
        image_url: imageUrl,
        alt_text: 'Promoção Cimento Nova',
        is_active: true,
        order_index: 10
      },
      {
        title: 'Semana da Pintura Nova',
        description: 'Tintas e acessórios com preços especiais - Imagem atualizada!',
        image_url: imageUrl,
        alt_text: 'Semana da Pintura Nova',
        is_active: true,
        order_index: 11
      }
    ];
    
    for (const banner of newBanners) {
      console.log(`🔄 Criando banner: ${banner.title}`);
      
      const { data: createResult, error: createError } = await supabase
        .from('dynamic_banners')
        .insert(banner)
        .select('*');
      
      if (createError) {
        console.error(`❌ Erro ao criar banner ${banner.title}:`, createError);
      } else {
        console.log(`✅ Banner ${banner.title} criado com sucesso!`);
        console.log(`   ID: ${createResult[0].id}`);
        console.log(`   URL: ${createResult[0].image_url}`);
      }
    }
    
    // Verificar resultado final
    const { data: allBanners, error: fetchError } = await supabase
      .from('dynamic_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar banners:', fetchError);
    } else {
      console.log('\n📋 Todos os banners ativos:');
      allBanners.forEach(banner => {
        console.log(`  - ${banner.title}`);
        console.log(`    URL: ${banner.image_url}`);
        console.log(`    Order: ${banner.order_index}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createNewBanners();