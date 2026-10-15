import { supabase } from '@/integrations/supabase/client';

const sectionTables: Record<string, string> = {
  carousel: 'dynamic_banners', categories: 'dynamic_categories',
  clips: 'dynamic_clips', rentals: 'dynamic_rentals',
  'category-chips': 'dynamic_category_chips',
  'popular-categories': 'dynamic_popular_categories',
  'news-banner': 'dynamic_news_banners',
  'promo-banner': 'dynamic_promotional_banners',
  'product-detail-banner': 'dynamic_product_detail_banners',
  featured: 'dynamic_products', paint: 'dynamic_products', essential: 'dynamic_products',
  offers: 'dynamic_products', tiles: 'dynamic_products', decoration: 'dynamic_products',
  topChoices: 'dynamic_products', electro: 'dynamic_products', tools: 'dynamic_products',
};

export async function deleteSectionItem(section: string, id: string | number) {
  const table = sectionTables[section];
  if (!table || !id) throw new Error('Selecione um item cadastrado para excluir.');
  const { data, error, count } = await supabase.from(table).delete().eq('id', id).select('id');
  if (error) throw new Error(error.message || 'Não foi possível excluir o item.');
  if (!(count ? count > 0 : Array.isArray(data) && data.length > 0)) {
    throw new Error('Item não encontrado. Atualize a lista e tente novamente.');
  }
}
