require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function directSQLUpdate() {
  try {
    console.log('🔧 Tentando atualização via SQL direto...');
    
    const newImageUrl = `https://gpbepsinnvatubokfgvr.supabase.co/storage/v1/object/public/product-images/banners/banners_1758212977921_6m6ez3ulcce.png?t=${Date.now()}`;
    
    // Tentar usar rpc (função SQL) para atualizar
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('update_banner_images', {
        new_image_url: newImageUrl
      });
    
    if (rpcError) {
      console.log('⚠️ RPC não disponível, tentando UPDATE direto...');
      
      // Tentar UPDATE com diferentes abordagens
      console.log('🔄 Tentativa 1: UPDATE simples...');
      const { data: result1, error: error1 } = await supabase
        .from('dynamic_banners')
        .update({ image_url: newImageUrl })
        .eq('id', 1)
        .select('*');
      
      console.log('Resultado 1:', { data: result1, error: error1 });
      
      console.log('🔄 Tentativa 2: UPDATE com todos os campos...');
      const { data: result2, error: error2 } = await supabase
        .from('dynamic_banners')
        .update({ 
          image_url: newImageUrl,
          updated_at: new Date().toISOString(),
          title: 'Promoção Cimento ATUALIZADO'
        })
        .eq('id', 1)
        .select('*');
      
      console.log('Resultado 2:', { data: result2, error: error2 });
      
      console.log('🔄 Tentativa 3: UPSERT...');
      const { data: result3, error: error3 } = await supabase
        .from('dynamic_banners')
        .upsert({ 
          id: 1,
          title: 'Promoção Cimento UPSERT',
          image_url: newImageUrl,
          updated_at: new Date().toISOString(),
          is_active: true
        })
        .select('*');
      
      console.log('Resultado 3:', { data: result3, error: error3 });
      
    } else {
      console.log('✅ RPC executado com sucesso:', rpcResult);
    }
    
    // Verificar estado final
    const { data: finalState, error: finalError } = await supabase
      .from('dynamic_banners')
      .select('*')
      .eq('id', 1);
    
    console.log('\n📋 Estado final do banner ID 1:');
    console.log(JSON.stringify(finalState, null, 2));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

directSQLUpdate();