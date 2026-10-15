import type { Product } from '@/types';
const normalize=(value:unknown)=>String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const money=(value:unknown)=>{
 const text=String(value ?? '').trim();if(text.startsWith('R$'))return text;
 const number=Number(text.includes(',')?text.replace(/\./g,'').replace(',','.'):text);
 return text && Number.isFinite(number)?number.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Preço não informado';
};
export function buildHomeProductSections(dynamic:any[], originals:any[]) {
 const published=originals.filter(p=>p.status==='active' && p.approval_status==='approved' && p.product_type!=='rental' && !String(p.description || '').startsWith('[LOCAÇÃO]'));
 const sourceMap=new Map(published.map(p=>[String(p.id),p]));
 type Entry={product:Product;featured:boolean;essential:boolean;top:boolean;group:string;category:string};
 const entries=new Map<string,Entry>();
 const add=(row:any,source?:any)=>{
  const category=String(source?.category || row.category || '');const group=normalize(row.product_group);
  const product:Product={id:source?.id || row.id,name:String(source?.title || row.name || ''),price:money(source?.price ?? row.price),image:source?.images?.[0] || row.image_url || '',category,type:row.type==='decoração'?'decoração':row.type==='serviço'?'serviço':'produto',rating:Number(row.rating)||0,isOffer:row.is_offer===true,description:source?.description || row.description || ''};
  if(!product.name)return;
  entries.set(String(product.id),{product,featured:row.is_featured===true || source?.is_featured===true,essential:row.is_essential===true,top:row.is_top_choice===true,group,category:normalize(category)});
 };
 for(const row of dynamic){
  if(row.is_active!==true || ['rental','locacao'].includes(normalize(row.product_group)) || normalize(row.type)==='locacao')continue;
  const source=row.source_product_id?sourceMap.get(String(row.source_product_id)):undefined;
  if(row.source_product_id && !source)continue;
  add(row,source);
 }
 for(const source of published)if(!entries.has(String(source.id)))add({id:source.id,name:source.title,price:source.price,image_url:source.images?.[0],category:source.category,is_featured:source.is_featured},source);
 const all=[...entries.values()];const pick=(match:(entry:Entry)=>boolean)=>all.filter(match).slice(0,8).map(entry=>entry.product);
 return {
  featured:pick(e=>e.featured),essential:pick(e=>e.essential || ['essential','essentials'].includes(e.group) || /cimento|argamassa|areia|brita|tijolo|construcao|materiais basicos/.test(e.category)),
  top:pick(e=>e.top),paint:pick(e=>e.group==='paint' || /pintura|tinta/.test(e.category)),
  tiles:pick(e=>e.group==='tiles' || /telha|cobertura/.test(e.category)),
  decoration:pick(e=>e.group==='decoration' || /decoracao|decorar/.test(e.category) || e.product.type==='decoração'),
  electro:pick(e=>e.group==='electro' || /eletro|eletric|iluminacao/.test(e.category)),tools:pick(e=>/ferramenta/.test(e.category))
 };
}
