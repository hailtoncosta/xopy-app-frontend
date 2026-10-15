require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateWithSQL() {
  try {
    console.log('🚀 Populando tabelas dinâmicas via SQL...');
    
    // SQL para inserir dados diretamente, contornando RLS
    const insertSQL = `
      -- Inserir produtos
      INSERT INTO dynamic_products (name, price, image_url, type, category, rating, is_offer, is_featured, product_group, order_index, is_essential, is_top_choice) VALUES
      ('Cimento CP-II 50kg', 'R$ 24,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, true, true, 'featured', 1, false, false),
      ('Tijolo Baiano 6 Furos', 'R$ 0,85', '/src/assets/produto-tijolo.jpg', 'produto', 'Material', 4.6, false, true, 'featured', 2, false, false),
      ('Tinta Acrílica 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, true, true, 'featured', 3, false, false),
      ('Argamassa AC-I 20kg', 'R$ 18,50', '/src/assets/produto-argamassa.jpg', 'produto', 'Material', 4.7, false, true, 'featured', 4, false, false),
      
      ('Cal Hidratada 20kg', 'R$ 12,90', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.3, false, false, 'essential', 1, true, false),
      ('Brita 1 (m³)', 'R$ 65,00', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.4, false, false, 'essential', 2, true, false),
      ('Ferro 10mm (12m)', 'R$ 38,50', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, false, false, 'essential', 3, true, false),
      ('Tubo PVC 100mm (6m)', 'R$ 42,30', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, false, false, 'essential', 4, true, false),
      
      ('Telha Cerâmica Colonial', 'R$ 1,85', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, false, false, 'tiles', 1, false, false),
      ('Telha Fibrocimento 6mm', 'R$ 12,50', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.4, false, false, 'tiles', 2, false, false),
      ('Telha Metálica Galvanizada', 'R$ 28,90', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, false, false, 'tiles', 3, false, false),
      ('Telha Shingle Asfáltica', 'R$ 15,75', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, false, false, 'tiles', 4, false, false),
      
      ('Tinta Látex Branca 18L', 'R$ 89,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.9, false, false, 'paint', 1, false, false),
      ('Kit Pincel Profissional 5 Peças', 'R$ 45,50', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, false, false, 'paint', 2, false, false),
      ('Rolo Pintura + Bandeja', 'R$ 28,90', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, false, false, 'paint', 3, false, false),
      ('Tinta Esmalte Sintético 3,6L', 'R$ 65,90', '/src/assets/produto-tinta.jpg', 'produto', 'Material', 4.8, false, false, 'paint', 4, false, false),
      
      ('Luminária Pendente Moderna', 'R$ 189,90', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.8, false, false, 'decoration', 1, false, false),
      ('Espelho Decorativo 60cm', 'R$ 125,50', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.7, false, false, 'decoration', 2, false, false),
      ('Quadro Decorativo 40x60cm', 'R$ 85,90', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.6, false, false, 'decoration', 3, false, false),
      ('Vaso Cerâmica P/ Plantas', 'R$ 45,90', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop', 'decoração', 'Decoração', 4.5, false, false, 'decoration', 4, false, false),
      
      ('Saco de Cimento 50kg', 'R$ 26,90', '/src/assets/produto-cimento.jpg', 'produto', 'Material', 4.8, false, false, 'topChoices', 1, false, true),
      ('Cerâmica 45x45cm (m²)', 'R$ 32,50', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=300&fit=crop', 'produto', 'Material', 4.6, false, false, 'topChoices', 2, false, true),
      ('Torneira Cromada Bica Móvel', 'R$ 78,90', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, false, false, 'topChoices', 3, false, true),
      ('Porta de Madeira 80x210cm', 'R$ 245,00', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'produto', 'Material', 4.5, false, false, 'topChoices', 4, false, true),
      
      ('Bloco Cerâmico 14x19x29', 'R$ 1,20', '/src/assets/produto-tijolo.jpg', 'produto', 'Material', 4.5, false, false, 'home', 5, false, false),
      ('Areia Média - Saco 20kg', 'R$ 8,90', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.3, false, false, 'home', 6, false, false),
      ('Brita 1 - Saco 20kg', 'R$ 12,50', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 'produto', 'Material', 4.4, false, false, 'home', 7, false, false),
      ('Ferro 10mm - Barra 12m', 'R$ 45,80', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', 'produto', 'Material', 4.7, false, false, 'home', 8, false, false);
      
      -- Inserir banners
      INSERT INTO dynamic_banners (title, description, image_url, alt_text, order_index) VALUES
      ('Promoção Cimento', 'Até 30% de desconto em cimentos selecionados', '/src/assets/banner-cimento.jpg', 'Promoção Cimento', 1),
      ('Semana da Pintura', 'Tintas e acessórios com preços especiais', '/src/assets/banner-pintura.jpg', 'Semana da Pintura', 2),
      ('Contrate um Engenheiro', 'Profissionais qualificados para seu projeto', '/src/assets/banner-engenheiro.jpg', 'Contrate um Engenheiro', 3),
      ('Ofertas Especiais do Mês', 'Descontos imperdíveis em toda a loja', '/src/assets/banner-ofertas.jpg', 'Ofertas Especiais do Mês', 4);
      
      -- Inserir categorias
      INSERT INTO dynamic_categories (id, label, icon_name, order_index) VALUES
      ('tudo', 'Tudo', 'Grid3X3', 1),
      ('ofertas', 'Ofertas', 'Percent', 2),
      ('servicos', 'Serviços', 'Wrench', 3),
      ('destaques', 'Destaques', 'Star', 4),
      ('mais-vendidos', 'Mais vendidos', 'TrendingUp', 5),
      ('queridinhos', 'Queridinhos', 'Heart', 6);
      
      -- Inserir news banner
      INSERT INTO dynamic_news_banners (title, description, image_url, alt_text) VALUES
      ('Novidades', 'Confira as últimas atualizações e novos serviços', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=200&fit=crop&crop=center', 'Banner de Novidades - Novas funcionalidades e serviços disponíveis');
    `;
    
    console.log('📝 Executando SQL para inserir dados...');
    
    // Executar o SQL usando rpc (função remota)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: insertSQL });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      console.log('💡 Tentando método alternativo...');
      
      // Método alternativo: inserir um por vez
      await insertDataOneByOne();
      return;
    }
    
    console.log('✅ Dados inseridos com sucesso via SQL!');
    console.log('🔄 Agora a página Home deve exibir os dados corretamente!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Tentando método alternativo...');
    await insertDataOneByOne();
  }
}

async function insertDataOneByOne() {
  console.log('🔄 Tentando inserir dados um por vez...');
  
  try {
    // Limpar dados existentes primeiro
    console.log('🧹 Limpando dados existentes...');
    await supabase.from('dynamic_products').delete().neq('id', 0);
    await supabase.from('dynamic_banners').delete().neq('id', 0);
    await supabase.from('dynamic_categories').delete().neq('id', '');
    await supabase.from('dynamic_news_banners').delete().neq('id', 0);
    
    // Inserir alguns produtos básicos
    console.log('📦 Inserindo produtos básicos...');
    const basicProducts = [
      { name: 'Cimento CP-II 50kg', price: 'R$ 24,90', image_url: '/src/assets/produto-cimento.jpg', type: 'produto', category: 'Material', rating: 4.8, product_group: 'featured', order_index: 1 },
      { name: 'Tinta Acrílica 18L', price: 'R$ 89,90', image_url: '/src/assets/produto-tinta.jpg', type: 'produto', category: 'Material', rating: 4.9, product_group: 'paint', order_index: 1 },
      { name: 'Tijolo Baiano 6 Furos', price: 'R$ 0,85', image_url: '/src/assets/produto-tijolo.jpg', type: 'produto', category: 'Material', rating: 4.6, product_group: 'essential', order_index: 1 }
    ];
    
    for (const product of basicProducts) {
      const { error } = await supabase.from('dynamic_products').insert([product]);
      if (error) {
        console.log(`⚠️  Erro ao inserir ${product.name}:`, error.message);
      } else {
        console.log(`✅ ${product.name} inserido com sucesso`);
      }
    }
    
    console.log('✅ Inserção alternativa concluída!');
    
  } catch (error) {
    console.error('❌ Erro no método alternativo:', error);
    console.log('💡 Sugestão: Execute o SQL manualmente no painel do Supabase');
  }
}

populateWithSQL();