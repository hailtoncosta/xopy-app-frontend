require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBannersStorage() {
  try {
    console.log('📁 Verificando arquivos na pasta banners...');
    
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('banners', { limit: 100 });
    
    if (listError) {
      console.error('❌ Erro ao listar arquivos:', listError);
      return;
    }
    
    console.log(`✅ Arquivos na pasta banners: ${files.length}`);
    files.forEach(file => {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`banners/${file.name}`);
      
      console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      console.log(`    URL: ${data.publicUrl}`);
    });
    
    console.log('\n🗄️ Verificando banners no banco de dados...');
    
    const { data: banners, error: dbError } = await supabase
      .from('dynamic_banners')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (dbError) {
      console.error('❌ Erro ao buscar banners:', dbError);
      return;
    }
    
    console.log(`✅ Banners no banco de dados: ${banners.length}`);
    banners.forEach((banner, index) => {
      console.log(`  ${index + 1}. ${banner.title}`);
      console.log(`     Tipo: ${banner.type || 'undefined'}`);
      console.log(`     Ativo: ${banner.is_active}`);
      console.log(`     Imagem: ${banner.image_url}`);
      console.log(`     Criado: ${banner.created_at}`);
      console.log(`     Atualizado: ${banner.updated_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testBannersStorage();