import { supabase } from '@/integrations/supabase/client';

export interface RentalItem {
  id: string; name: string; category: string; price: string; period: string;
  image_url: string; images: string[]; available: boolean; popular: boolean;
  user_id?: string; shipping_cost?: number; rating: number; location: string; description: string;
}

export function rentalImages(...sources: unknown[]): string[] {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  return [...new Set(sources.flatMap(source => {
    if (Array.isArray(source)) return rentalImages(...source);
    if (typeof source !== 'string' || !source.trim()) return [];
    let url = source.trim();
    if (url.startsWith('[')) { try { return rentalImages(JSON.parse(url)); } catch { return []; } }
    if (/^(blob:|javascript:)/i.test(url) || url.includes('placeholder.svg')) return [];
    // Stored upload URLs can retain the development host; use the current API.
    const filePath = url.match(/\/api\/files\/public\/(.+)$/);
    if (filePath) url = `${base}/files/public/${filePath[1]}`;
    return [url];
  }))];
}

async function allRows(table: string, filters: Record<string, string>) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += 200) {
    let query = supabase.from(table).select('*').order('id', { ascending: true }).range(offset, offset + 199);
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 200) return rows;
  }
}

export async function loadRentalCatalog(): Promise<RentalItem[]> {
  const [staticRows, publications, products] = await Promise.all([
    allRows('dynamic_rentals', { is_active: 'true' }),
    allRows('dynamic_products', { is_active: 'true', product_group: 'rental' }),
    allRows('products_public_safe', { approval_status: 'approved', status: 'active' }),
  ]);
  const sourceIds = new Set(publications.map(p => p.source_product_id).filter(Boolean));
  const canonical = products.filter(p => p.product_type === 'rental' || p.description?.startsWith('[LOCAÇÃO]') || sourceIds.has(p.id));
  const byId = new Map<string, RentalItem>();
  for (const p of staticRows) {
    const images = rentalImages(p.images, p.image_url);
    byId.set(String(p.id), { ...p, id: String(p.id), images, image_url: images[0] || '', period: p.period || '/dia', price: String(p.price || '0'), location: p.location || 'Localização a consultar', description: p.description || '' });
  }
  for (const p of publications) {
    // References to a user product must still point to an approved, active record.
    if (p.source_product_id && !canonical.some(product => product.id === p.source_product_id)) continue;
    const images = rentalImages(p.image_url);
    const id = String(p.source_product_id || p.id);
    byId.set(id, { id, name: p.name, category: p.category, price: String(p.price || '0'), period: '/dia', images, image_url: images[0] || '', available: true, popular: false, rating: p.rating || 0, location: 'Localização a consultar', description: (p.description || '').replace(/^\[LOCAÇÃO\]\s*/, '') });
  }
  for (const p of canonical) {
    const prior = byId.get(p.id);
    const images = rentalImages(p.images, prior?.images);
    byId.set(p.id, { id: p.id, user_id: p.user_id, name: p.title, category: p.category, shipping_cost: Number(p.shipping_cost || 0), price: Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), period: '/dia', images, image_url: images[0] || '', available: true, popular: false, rating: prior?.rating || 0, location: p.location || 'Localização a consultar', description: (p.description || '').replace(/^\[LOCAÇÃO\]\s*/, '') });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
