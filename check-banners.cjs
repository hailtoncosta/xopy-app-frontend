require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkBanners() {
  try {
    const { data, error } = await supabase
      .from('dynamic_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro:', error);
      return;
    }

    console.log('Total de banners:', data.length);
    console.log('\n--- BANNERS ENCONTRADOS ---');
    
    data.forEach((banner, index) => {
      console.log(`\n${index + 1}. Banner ID: ${banner.id}`);
      console.log(`   Título: ${banner.title}`);
      console.log(`   URL da Imagem: ${banner.image_url}`);
      console.log(`   Ativo: ${banner.is_active}`);
      console.log(`   Criado em: ${banner.created_at}`);
      
      // Verificar se é uma URL do Supabase Storage ou caminho local
      if (banner.image_url.includes('supabase.co')) {
        console.log('   ✅ Imagem do Supabase Storage (adicionada via admin)');
      } else {
        console.log('   📁 Imagem local (dados iniciais)');
      }
    });
    
  } catch (error) {
    console.error('Erro ao verificar banners:', error);
  }
}

checkBanners();