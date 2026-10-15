import { appConfirm } from '@/lib/feedback';
import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { request, springClient } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RentalRequests() {
 const navigate = useNavigate();
 const { user, isLoading } = useAuth();
 const [params, setParams] = useSearchParams();
 const view = params.get('view') === 'sent' ? 'sent' : 'received';
 const [rows, setRows] = useState<any[]>([]);
 const [page, setPage] = useState(0);
 const [loading, setLoading] = useState(true);
 const [busy, setBusy] = useState<string | null>(null);
 const [error, setError] = useState('');
 const load = async () => { setLoading(true); setError(''); try { setRows((await request(`/rental-requests?view=${view}&page=${page}`)).data); } catch(e) { setRows([]); setError(e instanceof Error ? e.message : 'Erro ao carregar solicitações'); } finally { setLoading(false); } };
 useEffect(() => { if(user) load(); }, [user?.id, view, page]);
 const decide = async (id: string, status: string) => {
  if (!(await appConfirm(status === 'approved' ? 'Aprovar esta solicitação e disponibilizar o contrato ao cliente?' : 'Recusar esta solicitação de aluguel?'))) return;
  setBusy(id); try { await request(`/rental-requests/${id}/review`, 'POST', {status}); toast.success(status === 'approved' ? 'Aluguel aprovado' : 'Solicitação recusada'); await load(); } catch(e) { toast.error(e instanceof Error ? e.message : 'Erro ao analisar'); } finally { setBusy(null); }
 };
 const uploadContract = async (id: string, file?: File) => {
  if (!file || busy) return;
  if (file.size === 0 || file.size > 10 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf')) { toast.error('Envie um contrato em PDF de até 10 MB'); return; }
  setBusy(id);
  try {
   const { data: { session } } = await springClient.auth.getSession();
   const form = new FormData(); form.append('contract', file);
   const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
   const response = await fetch(`${base}/rental-requests/${id}/contract`, { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` }, body: form });
   if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.message || error.error || 'Não foi possível anexar o contrato'); }
   toast.success('Contrato de locação anexado com sucesso.'); await load();
  } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro ao enviar contrato'); }
  finally { setBusy(null); }
 };
 const pay = async (id: string) => {
  if (busy) return;
  setBusy(id);
  try { const data = await request(`/rental-requests/${id}/checkout`, 'POST', {}); navigate(`/pagamento/${data.checkoutId}?rental=1`); }
  catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível abrir o pagamento'); }
  finally { setBusy(null); }
 };
 const download = async (row: any, doc: any) => {
  try {
   const { data: { session } } = await springClient.auth.getSession();
   const base=(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
   const response=await fetch(`${base}/rental-requests/${row.id}/documents/${doc.id}`,{headers:{Authorization:`Bearer ${session?.access_token}`}});
   if(!response.ok) throw new Error('Não foi possível baixar o documento');
   const url=URL.createObjectURL(await response.blob()); const a=document.createElement('a'); a.href=url; a.download=doc.filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),10000);
  } catch(e) { toast.error(e instanceof Error ? e.message : 'Erro ao baixar documento'); }
 };
 if(isLoading) return <p className="p-6">Carregando...</p>;
 if(!user) return <div className="p-6"><Link to="/auth">Faça login para consultar as solicitações</Link></div>;
 const labels: Record<string,string>={pending:'Aguardando aprovação',approved:'Aprovado',rejected:'Recusado'};
 return <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-5">
  <Link to="/" className="text-orange-600">← Voltar ao início</Link>
  <h1 className="text-2xl font-bold">Solicitações de aluguel</h1>
  <p>Olá, {user.name}. Consulte os documentos e acompanhe a aprovação.</p>
  <div className="flex flex-wrap gap-2">{[['received','Recebidas pela empresa'],['sent','Minhas solicitações']].map(([key,label])=><Button key={key} variant={view===key?'default':'outline'} onClick={()=>{setPage(0);setParams({view:key});}}>{label}</Button>)}</div>
  {error && <div role="alert">{error} <Button onClick={load}>Tentar novamente</Button></div>}
  {loading ? <p>Carregando...</p> : !error && !rows.length ? <p>Nenhuma solicitação encontrada.</p> : !error && rows.map(row=><article key={row.id} className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
   <div className="flex justify-between flex-wrap gap-2"><h2 className="font-bold">{row.equipment_name}</h2><span className="text-orange-700">{labels[row.status]}</span></div>
   <p>{row.customer_name || row.customer_email} — {row.customer_email}</p>
   <p>{row.days} dia(s) • Solicitado em {new Date(row.created_at).toLocaleString('pt-BR')}</p>
   <p>Frete: {Number(row.shipping_cost || 0).toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</p>
   <p>{row.person_type === 'individual' ? 'CPF' : 'CNPJ'}: {row.cnpj}</p><p className="break-words">Endereço de entrega: {row.delivery_address}</p>
   <div className="flex flex-wrap gap-2">{row.documents.filter((doc:any)=>doc.kind!=='Contrato de locação').map((doc:any)=><Button key={doc.id} variant="outline" onClick={()=>download(row,doc)}>{doc.kind} ↓</Button>)}</div>
   {row.documents.filter((doc:any)=>doc.kind==='Contrato de locação').map((doc:any)=><section key={doc.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2"><h3 className="font-semibold">Contrato de locação {view==='sent' ? 'enviado pela empresa' : 'anexado'}</h3><p className="break-all text-sm">{doc.filename}</p><Button variant="outline" onClick={()=>download(row,doc)}>Baixar contrato de locação</Button></section>)}
   {view==='received' && (row.status==='pending' || (row.status==='approved' && !row.contract_document_id && !row.checkout_id)) && <div className="space-y-2"><label htmlFor={`contract-${row.id}`} className="block font-semibold">Envio de contrato</label><input id={`contract-${row.id}`} type="file" accept="application/pdf,.pdf" disabled={!!busy} className="block w-full text-sm" onChange={event=>{const file=event.target.files?.[0]; event.target.value=''; uploadContract(row.id,file);}} /><p className="text-sm text-gray-600">Anexe o contrato de locação em PDF (até 10 MB) para liberar a aprovação. O cliente receberá o contrato após a aprovação.</p></div>}
   {view==='sent' && row.status==='approved' && !row.contract_document_id && <p className="text-orange-700">Aguardando o contrato de locação da empresa para seguir ao pagamento.</p>}
   {row.payment_total != null && <p className="font-semibold">Valor do aluguel: {Number(row.payment_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
   {row.payment_status === 'paid' && <p className="font-semibold text-green-700">Pagamento confirmado</p>}
   {view==='sent' && row.status==='approved' && row.contract_document_id && !['paid','cancelled','refunded','charged_back'].includes(row.payment_status) && <Button disabled={!!busy} onClick={()=>pay(row.id)}>{busy===row.id ? 'Preparando pagamento...' : 'Seguir para o pagamento'}</Button>}
   {view==='received' && row.status==='pending' && <div className="flex gap-2"><Button disabled={!!busy || !row.contract_document_id} onClick={()=>decide(row.id,'approved')}>Aprovar aluguel</Button><Button variant="outline" disabled={busy===row.id} onClick={()=>decide(row.id,'rejected')}>Recusar</Button></div>}
  </article>)}
  <div className="flex items-center gap-3"><Button variant="outline" disabled={page===0 || loading} onClick={()=>setPage(page-1)}>Anterior</Button><span>Página {page+1}</span><Button variant="outline" disabled={rows.length<20 || loading} onClick={()=>setPage(page+1)}>Próxima</Button></div>
 </main>;
}
