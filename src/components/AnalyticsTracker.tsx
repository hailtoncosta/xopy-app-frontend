import {useEffect,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {request} from '@/integrations/api/client';
export default function AnalyticsTracker(){
 const location=useLocation();const last=useRef('');
 useEffect(()=>{
  if(location.pathname.startsWith('/admin') || last.current===location.pathname)return;
  last.current=location.pathname;
  try{
   const saved=JSON.parse(sessionStorage.getItem('xopy-analytics-session') || 'null');
   let session=saved && Date.now()-saved.last<30*60*1000?saved:null;
   if(!session){const query=new URLSearchParams(location.search),medium=(query.get('utm_medium') || '').toLowerCase();let host='';try{host=new URL(document.referrer).hostname;}catch{}
    const source=/cpc|ppc|paid/.test(medium)?'Anúncios pagos':medium==='email'?'Email':medium==='social'||/facebook|instagram|tiktok|linkedin|twitter|t\.co/.test(host)?'Redes sociais':/google|bing|duckduckgo|yahoo/.test(host)?'Busca orgânica':host && host!==window.location.hostname?'Referência':'Direto';
    const ua=navigator.userAgent;session={id:crypto.randomUUID(),source,device:/iPad|Tablet/i.test(ua)?'Tablet':/Mobi|Android|iPhone/i.test(ua)?'Mobile':'Desktop',last:Date.now()};}
   session.last=Date.now();sessionStorage.setItem('xopy-analytics-session',JSON.stringify(session));
   void request('/analytics/visit','POST',{sessionId:session.id,path:location.pathname.slice(0,300),source:session.source,device:session.device}).catch(()=>{});
  }catch{}
 },[location.pathname,location.search]);return null;
}
