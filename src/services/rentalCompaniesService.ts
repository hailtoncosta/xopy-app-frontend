import { request, springClient } from '@/integrations/api/client';
export function mergeRentalCompanies(profiles:any[],products:any[]) {
 const accounts=new Map(profiles.map(p=>[String(p.id),p]));const rows=new Map<string,any>();
 for(const profile of profiles)if(profile.user_type==='rental_company')rows.set(String(profile.id),{id:profile.id,name:profile.full_name || '',email:profile.email || '',phone:profile.phone || '',avatar_url:profile.avatar_url,created_at:profile.created_at,updated_at:profile.updated_at,rating:null,total_rentals:null});
 for(const product of products){
  if(!product.user_id || !accounts.has(String(product.user_id)) || product.seller_type!=='business' || !(product.product_type==='rental' || String(product.description || '').startsWith('[LOCAÇÃO]')))continue;
  const id=String(product.user_id);if(rows.get(id)?.hasCompanyData)continue;
  const profile=accounts.get(id);let info=product.seller_info || {};
  if(typeof info==='string'){try{info=JSON.parse(info);}catch{info={};}}
  rows.set(id,{id,name:info.businessName || profile.full_name || '',email:info.businessEmail || profile.email || '',phone:info.businessPhone || profile.phone || '',address:info.businessAddress || '',city:info.businessCity || '',state:info.businessState || '',avatar_url:profile.avatar_url,created_at:profile.created_at,updated_at:profile.updated_at,rating:null,total_rentals:null,hasCompanyData:true});
 }
 return [...rows.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
export async function getRentalCompanies() {
 try {
  const result=await request('/admin/rental-companies');
  if(!Array.isArray(result?.data))throw new Error('Resposta inválida da listagem');
  return result.data;
 } catch(error) {
  const message=error instanceof Error?error.message:'';
  if(/401|403/.test(message))throw error;
  const readAll=async(table:string)=>{
   const rows:any[]=[];
   for(let page=0;;page++){
    const result=await springClient.from(table).select('*').order('updated_at',{ascending:false}).order('id',{ascending:true}).range(page*500,page*500+499);
    if(result.error)throw new Error(result.error.message);
    const batch=Array.isArray(result.data)?result.data:[];rows.push(...batch);
    if(batch.length<500 || rows.length>=Number(result.count))return rows;
   }
  };
  const [profiles,products]=await Promise.all([readAll('user_profiles'),readAll('products')]);
  return mergeRentalCompanies(profiles,products);
 }
}
