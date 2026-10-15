require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Usar service_role key se disponível, senão usar publishable key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

// Criar cliente com privilégios administrativos se usando service_role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔑 Usando chave:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role (Admin)' : 'Publishable (Limitada)');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('💡 Para contornar políticas RLS, adicione SUPABASE_SERVICE_ROLE_KEY ao .env');
}

// Dados iniciais baseados nos dados estáticos
const initialProducts = [
  // Produtos em destaque
  { name: 'Cimento CP-II 50kg', price: 'R$ 24,90', image_url: '/src/assets/produto-cimento.jpg', type: 'produto', category: 'Material', rating: 4.8, is_offer: true, is_featured: true, product_group: 'featured', order_index: 1 },
  { name: 'Tijolo Baiano 6 Furos', price: 'R$ 0,85', image_url: '/src/assets/produto-tijolo.jpg', type: 'produto', category: 'Material', rating: 4.6, is_featured: true, product_group: 'featured', order_index: 2 },
  { name: 'Tinta Acrílica 18L', price: 'R$ 89,90', image_url: '/src/assets/produto-tinta.jpg', type: 'produto', category: 'Material', rating: 4.9, is_offer: true, is_featured: true, product_group: 'featured', order_index: 3 },
  { name: 'Argamassa AC-I 20kg', price: 'R$ 18,50', image_url: '/src/assets/produto-argamassa.jpg', type: 'produto', category: 'Material', rating: 4.7, is_featured: true, product_group: 'featured', order_index: 4 },
  
  // Produtos essenciais
  { name: 'Cal Hidratada 20kg', price: 'R$ 12,90', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.3, is_essential: true, product_group: 'essential', order_index: 1 },
  { name: 'Brita 1 (m³)', price: 'R$ 65,00', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.4, is_essential: true, product_group: 'essential', order_index: 2 },
  { name: 'Ferro 10mm (12m)', price: 'R$ 38,50', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.7, is_essential: true, product_group: 'essential', order_index: 3 },
  { name: 'Tubo PVC 100mm (6m)', price: 'R$ 42,30', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.5, is_essential: true, product_group: 'essential', order_index: 4 },
  
  // Telhas
  { name: 'Telha Cerâmica Colonial', price: 'R$ 1,85', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.6, product_group: 'tiles', order_index: 1 },
  { name: 'Telha Fibrocimento 6mm', price: 'R$ 12,50', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.4, product_group: 'tiles', order_index: 2 },
  { name: 'Telha Metálica Galvanizada', price: 'R$ 28,90', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.7, product_group: 'tiles', order_index: 3 },
  { name: 'Telha Shingle Asfáltica', price: 'R$ 15,75', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.5, product_group: 'tiles', order_index: 4 },
  
  // Semana da pintura
  { name: 'Tinta Látex Branca 18L', price: 'R$ 89,90', image_url: '/src/assets/produto-tinta.jpg', type: 'produto', category: 'Material', rating: 4.9, product_group: 'paint', order_index: 1 },
  { name: 'Kit Pincel Profissional 5 Peças', price: 'R$ 45,50', image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.7, product_group: 'paint', order_index: 2 },
  { name: 'Rolo Pintura + Bandeja', price: 'R$ 28,90', image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.6, product_group: 'paint', order_index: 3 },
  { name: 'Tinta Esmalte Sintético 3,6L', price: 'R$ 65,90', image_url: '/src/assets/produto-tinta.jpg', type: 'produto', category: 'Material', rating: 4.8, product_group: 'paint', order_index: 4 },
  
  // Decoração
  { name: 'Luminária Pendente Moderna', price: 'R$ 189,90', image_url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=300&fit=crop', type: 'decoração', category: 'Decoração', rating: 4.8, product_group: 'decoration', order_index: 1 },
  { name: 'Espelho Decorativo 60cm', price: 'R$ 125,50', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', type: 'decoração', category: 'Decoração', rating: 4.7, product_group: 'decoration', order_index: 2 },
  { name: 'Quadro Decorativo 40x60cm', price: 'R$ 85,90', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop', type: 'decoração', category: 'Decoração', rating: 4.6, product_group: 'decoration', order_index: 3 },
  { name: 'Vaso Cerâmica P/ Plantas', price: 'R$ 45,90', image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop', type: 'decoração', category: 'Decoração', rating: 4.5, product_group: 'decoration', order_index: 4 },
  
  // Top escolhas
  { name: 'Saco de Cimento 50kg', price: 'R$ 26,90', image_url: '/src/assets/produto-cimento.jpg', type: 'produto', category: 'Material', rating: 4.8, is_top_choice: true, product_group: 'topChoices', order_index: 1 },
  { name: 'Cerâmica 45x45cm (m²)', price: 'R$ 32,50', image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.6, is_top_choice: true, product_group: 'topChoices', order_index: 2 },
  { name: 'Torneira Cromada Bica Móvel', price: 'R$ 78,90', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.7, is_top_choice: true, product_group: 'topChoices', order_index: 3 },
  { name: 'Porta de Madeira 80x210cm', price: 'R$ 245,00', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.5, is_top_choice: true, product_group: 'topChoices', order_index: 4 },
  
  // Produtos home
  { name: 'Bloco Cerâmico 14x19x29', price: 'R$ 1,20', image_url: '/src/assets/produto-tijolo.jpg', type: 'produto', category: 'Material', rating: 4.5, product_group: 'home', order_index: 5 },
  { name: 'Areia Média - Saco 20kg', price: 'R$ 8,90', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.3, product_group: 'home', order_index: 6 },
  { name: 'Brita 1 - Saco 20kg', price: 'R$ 12,50', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.4, product_group: 'home', order_index: 7 },
  { name: 'Ferro 10mm - Barra 12m', price: 'R$ 45,80', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', type: 'produto', category: 'Material', rating: 4.7, product_group: 'home', order_index: 8 }
];

const initialBanners = [
  { title: 'Promoção Cimento', description: 'Até 30% de desconto em cimentos selecionados', image_url: '/src/assets/banner-cimento.jpg', alt_text: 'Promoção Cimento', order_index: 1 },
  { title: 'Semana da Pintura', description: 'Tintas e acessórios com preços especiais', image_url: '/src/assets/banner-pintura.jpg', alt_text: 'Semana da Pintura', order_index: 2 },
  { title: 'Contrate um Engenheiro', description: 'Profissionais qualificados para seu projeto', image_url: '/src/assets/banner-engenheiro.jpg', alt_text: 'Contrate um Engenheiro', order_index: 3 },
  { title: 'Ofertas Especiais do Mês', description: 'Descontos imperdíveis em toda a loja', image_url: '/src/assets/banner-ofertas.jpg', alt_text: 'Ofertas Especiais do Mês', order_index: 4 }
];

const initialCategories = [
  { id: 'tudo', label: 'Tudo', icon_name: 'Grid3X3', order_index: 1 },
  { id: 'ofertas', label: 'Ofertas', icon_name: 'Percent', order_index: 2 },
  { id: 'servicos', label: 'Serviços', icon_name: 'Wrench', order_index: 3 },
  { id: 'destaques', label: 'Destaques', icon_name: 'Star', order_index: 4 },
  { id: 'mais-vendidos', label: 'Mais vendidos', icon_name: 'TrendingUp', order_index: 5 },
  { id: 'queridinhos', label: 'Queridinhos', icon_name: 'Heart', order_index: 6 }
];

const initialNewsBanner = {
  title: 'Novidades',
  description: 'Confira as últimas atualizações e novos serviços',
  image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=200&fit=crop&crop=center',
  alt_text: 'Banner de Novidades - Novas funcionalidades e serviços disponíveis'
};

async function populateTables() {
  try {
    console.log('🚀 Populando tabelas dinâmicas...');
    
    // Verificar se já existem dados
    const { data: existingProducts } = await supabase
      .from('dynamic_products')
      .select('count')
      .single();
    
    if (existingProducts && existingProducts.count > 0) {
      console.log('⚠️  Tabelas já contêm dados. Deseja continuar? (y/n)');
      // Para automação, vamos limpar e repovoar
      console.log('🧹 Limpando dados existentes...');
      
      await supabase.from('dynamic_products').delete().neq('id', 0);
      await supabase.from('dynamic_banners').delete().neq('id', 0);
      await supabase.from('dynamic_categories').delete().neq('id', '');
      await supabase.from('dynamic_news_banners').delete().neq('id', 0);
    }
    
    // Inserir produtos
    console.log('📦 Inserindo produtos...');
    const { error: productsError } = await supabase
      .from('dynamic_products')
      .insert(initialProducts);
    
    if (productsError) {
      console.error('❌ Erro ao inserir produtos:', productsError);
      return;
    }
    
    // Inserir banners
    console.log('🖼️  Inserindo banners...');
    const { error: bannersError } = await supabase
      .from('dynamic_banners')
      .insert(initialBanners);
    
    if (bannersError) {
      console.error('❌ Erro ao inserir banners:', bannersError);
      return;
    }
    
    // Inserir categorias
    console.log('📂 Inserindo categorias...');
    const { error: categoriesError } = await supabase
      .from('dynamic_categories')
      .insert(initialCategories);
    
    if (categoriesError) {
      console.error('❌ Erro ao inserir categorias:', categoriesError);
      return;
    }
    
    // Inserir news banner
    console.log('📰 Inserindo news banner...');
    const { error: newsError } = await supabase
      .from('dynamic_news_banners')
      .insert([initialNewsBanner]);
    
    if (newsError) {
      console.error('❌ Erro ao inserir news banner:', newsError);
      return;
    }
    
    console.log('✅ Dados inseridos com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${initialProducts.length} produtos`);
    console.log(`   - ${initialBanners.length} banners`);
    console.log(`   - ${initialCategories.length} categorias`);
    console.log('   - 1 news banner');
    console.log('');
    console.log('🔄 Agora a página Home deve exibir os dados corretamente!');
    console.log('💡 Reinicie o servidor de desenvolvimento se necessário: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

populateTables();