require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  try {
    console.log('🔍 Verificando políticas RLS e permissões...');
    
    // Tentar fazer uma atualização simples em um banner específico
    const { data: banners, error: fetchError } = await supabase
      .from('dynamic_banners')
      .select('id, title, image_url')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar banners:', fetchError);
      return;
    }
    
    if (banners.length === 0) {
      console.log('❌ Nenhum banner encontrado');
      return;
    }
    
    const banner = banners[0];
    console.log(`🎯 Testando atualização no banner: ${banner.title}`);
    console.log(`📍 ID: ${banner.id}`);
    console.log(`🖼️ URL atual: ${banner.image_url}`);
    
    const newUrl = `https://gpbepsinnvatubokfgvr.supabase.co/storage/v1/object/public/product-images/banners/banners_1758212977921_6m6ez3ulcce.png?t=${Date.now()}`;
    
    // Tentar atualização direta
    const { data: updateData, error: updateError } = await supabase
      .from('dynamic_banners')
      .update({ 
        image_url: newUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', banner.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
      console.log('🔍 Detalhes do erro:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('✅ Atualização bem-sucedida!');
      console.log('📊 Dados atualizados:', updateData);
    }
    
    // Verificar se a mudança foi persistida
    const { data: verifyData, error: verifyError } = await supabase
      .from('dynamic_banners')
      .select('title, image_url, updated_at')
      .eq('id', banner.id);
    
    if (verifyError) {
      console.error('❌ Erro na verificação:', verifyError);
    } else {
      console.log('\n🔍 Verificação pós-atualização:');
      console.log(`  - Título: ${verifyData[0].title}`);
      console.log(`  - URL: ${verifyData[0].image_url}`);
      console.log(`  - Atualizado: ${verifyData[0].updated_at}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkRLSPolicies();