import {useState,useEffect,useCallback} from 'react';
import {contentService} from '@/services/contentService';
import {supabase} from '@/integrations/supabase/client';
import type {Banner} from '@/components/home/BannerCarousel';
export const useBannerSync=(_fallbackBanners:Banner[]=[])=>{
 const [banners,setBanners]=useState<Banner[]>([]);const [isLoading,setIsLoading]=useState(true);const [error,setError]=useState('');
 const [newsBanner,setNewsBanner]=useState<any>(null);const [promotionalBanner,setPromotionalBanner]=useState<any>(null);
 const refreshBanners=useCallback(async()=>{
  setIsLoading(true);setError('');
  try{const [result,news,promo]=await Promise.all([supabase.from('dynamic_banners').select('*').eq('is_active',true).order('order_index',{ascending:true}).limit(500),contentService.getNewsBanner(),contentService.getPromotionalBanner()]);if(result.error)throw new Error(result.error.message);setBanners((result.data || []).filter((banner:Banner)=>Boolean(banner.image_url)));setNewsBanner(news);setPromotionalBanner(promo);}
  catch{setBanners([]);setError('Não foi possível carregar as imagens.');}
  finally{setIsLoading(false);}
 },[]);
 useEffect(()=>{void refreshBanners();const update=()=>{void refreshBanners();};const events=['bannerUpdated','contentUpdated','adminContentUpdated','forceContentReload'];events.forEach(event=>window.addEventListener(event,update));window.addEventListener('focus',update);return()=>{events.forEach(event=>window.removeEventListener(event,update));window.removeEventListener('focus',update);};},[refreshBanners]);
 return {banners,newsBanner,promotionalBanner,isLoading,error,refreshBanners};
};
