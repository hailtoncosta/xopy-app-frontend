require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBannerUrls() {
  try {
    console.log('🔧 Forçando atualização das URLs dos banners...');
    
    // Buscar o arquivo mais recente no storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('product-images')
      .list('banners', { limit: 100 });
    
    if (storageError) {
      console.error('❌ Erro ao buscar arquivos do storage:', storageError);
      return;
    }
    
    // Pegar o arquivo mais recente
    const latestFile = storageFiles
      .filter(f => f.name.endsWith('.jpg') || f.name.endsWith('.png'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    
    if (!latestFile) {
      console.error('❌ Nenhum arquivo de imagem encontrado');
      return;
    }
    
    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(`banners/${latestFile.name}`);
    
    const newImageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log(`🔗 Nova URL: ${newImageUrl}`);
    
    // Atualizar TODOS os banners diretamente
    const { data: updateResult, error: updateError } = await supabase
      .from('dynamic_banners')
      .update({ 
        image_url: newImageUrl,
        updated_at: new Date().toISOString()
      })
      .neq('id', 0); // Atualiza todos os registros
    
    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
    } else {
      console.log('✅ Todos os banners foram atualizados!');
      console.log('📊 Resultado:', updateResult);
    }
    
    // Verificar se a atualização funcionou
    const { data: banners, error: fetchError } = await supabase
      .from('dynamic_banners')
      .select('title, image_url, updated_at');
    
    if (fetchError) {
      console.error('❌ Erro ao verificar banners:', fetchError);
    } else {
      console.log('\n📋 Status atual dos banners:');
      banners.forEach(banner => {
        console.log(`  - ${banner.title}: ${banner.image_url}`);
        console.log(`    Atualizado em: ${banner.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixBannerUrls();