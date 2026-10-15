import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
export function usePendingProviders() {
 const {admin,isAdmin}=useAdminAuth();const [count,setCount]=useState(0);
 useEffect(()=>{
  setCount(0);if(!admin || !isAdmin)return;
  let active=true,sequence=0;
  const refresh=async()=>{const current=++sequence;const result=await supabase.from('service_providers').select('id',{count:'exact',head:true}).eq('status','pending').limit(1);if(active && current===sequence){if(!result.error)setCount(Number(result.count)||0);else console.error('Erro ao consultar prestadores pendentes:',result.error);}};
  void refresh();const timer=window.setInterval(()=>{if(!document.hidden)void refresh();},30000);
  const update=()=>{void refresh();};window.addEventListener('focus',update);window.addEventListener('contentUpdated',update);
  return()=>{active=false;window.clearInterval(timer);window.removeEventListener('focus',update);window.removeEventListener('contentUpdated',update);};
 },[admin?.id,isAdmin]);
 return admin && isAdmin ? count : 0;
}
