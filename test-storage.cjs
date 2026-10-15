require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testando Supabase Storage...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    console.log('\n📦 Listando buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se o bucket product-images existe
    const productImagesBucket = buckets.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      console.error('❌ Bucket "product-images" não encontrado!');
      return;
    }
    
    console.log('\n📁 Listando arquivos no bucket product-images...');
    const { data: files, error: filesError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 100 });
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError);
      return;
    }
    
    console.log('✅ Arquivos encontrados:', files.length);
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
    });
    
    // Listar arquivos na pasta general
    console.log('\n📁 Listando arquivos na pasta general...');
    const { data: generalFiles, error: generalError } = await supabase.storage
      .from('product-images')
      .list('general', { limit: 100 });
    
    if (generalError) {
      console.error('❌ Erro ao listar arquivos da pasta general:', generalError);
    } else {
      console.log('✅ Arquivos na pasta general:', generalFiles.length);
      generalFiles.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      });
    }
    
    // Testar URL pública
    if (generalFiles && generalFiles.length > 0) {
      const testFile = generalFiles[0];
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(`general/${testFile.name}`);
      
      console.log('\n🔗 URL pública de teste:', urlData.publicUrl);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testStorage();