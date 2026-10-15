import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '@/integrations/api/client';
export default function SellerPaymentAccount() {
 const navigate=useNavigate(); const [enabled,setEnabled]=useState<boolean|null>(null);const [error,setError]=useState('');
 useEffect(()=>{request('/payments/config').then(data=>setEnabled(data.enabled)).catch(e=>setError(e.message));},[]);
 return <main className="mx-auto max-w-xl p-4 sm:p-8 space-y-4"><button onClick={()=>navigate('/profile')} className="text-orange-600">← Voltar</button><h1 className="text-2xl font-bold">Pagamentos de vendas e aluguéis</h1><section className="rounded-2xl border bg-white p-5 space-y-3"><p>Os pagamentos por Pix e cartão são recebidos na conta Mercado Pago do Xopy.</p><p>Você não precisa conectar uma conta Mercado Pago. Cada pagamento permanece identificado com o vendedor ou empresa responsável.</p>{enabled!==null && <p className="font-semibold">{enabled?'Pagamentos configurados pelo Xopy':'Aguardando ativação dos pagamentos pelo Xopy'}</p>}<p className="text-sm text-gray-600">Para informações sobre repasses, entre em contato com o Xopy.</p>{error && <p role="alert" className="text-red-700">{error}</p>}</section></main>;
}
