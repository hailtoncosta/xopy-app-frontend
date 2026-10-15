import { appConfirm } from '@/lib/feedback';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, RefreshCw, Search, Truck, Trash2, Check, X, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { request } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Status = 'pending' | 'approved' | 'rejected';
interface Equipment {
  id: string; title: string; description: string; category: string; price: number;
  condition?: string; manufacturing_date?: string; created_at: string; images?: string[];
  approval_status?: Status; admin_comments?: string; seller_type: string;
  seller_info?: Record<string, string>;
}
const labels = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' };
const colors = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const ownerName = (item: Equipment) => item.seller_info?.businessName || item.seller_info?.name || 'Não informado';

export default function RentalEquipment() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [stats, setStats] = useState({all:0,pending:0,approved:0,rejected:0});
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [rejectionItem,setRejectionItem]=useState<Equipment|null>(null);
  const [rejectionReason,setRejectionReason]=useState('');
  const openRejection=(item:Equipment)=>{if(inFlight.current)return;setSelected(null);setRejectionItem(item);setRejectionReason('');};
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const sequence = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), status, search: query });
      const [result, ...summaries] = await Promise.all([
        request(`/admin/rental-equipment?${params}`),
        ...['all','pending','approved','rejected'].map(value=>request(`/admin/rental-equipment?status=${value}&page=0`))
      ]);
      if (current !== sequence.current) return;
      if (page > 0 && result.count <= page * 20) { setPage(page - 1); return; }
      setItems(result.data); setCount(result.count);
      setStats({all:Number(summaries[0].count)||0,pending:Number(summaries[1].count)||0,approved:Number(summaries[2].count)||0,rejected:Number(summaries[3].count)||0});
    } catch (e) {
      if (current === sequence.current) setError(e instanceof Error ? e.message : 'Erro ao carregar equipamentos');
    } finally { if (current === sequence.current) setLoading(false); }
  }, [page, status, query]);
  useEffect(() => { void load(); return () => { sequence.current++; }; }, [load]);

  const review = async (decision: 'approved' | 'rejected', equipment: Equipment | null = selected, rejectionReason?: string) => {
    if (!equipment || inFlight.current) return;
    if (decision === 'rejected' && !String(rejectionReason ?? comments).trim()) { toast.error('Informe o motivo da rejeição'); return; }
    inFlight.current = true; setSaving(true);
    try {
      await request(`/admin/rental-equipment/${equipment.id}/review`, 'POST', { status: decision, comments: decision==='rejected' ? String(rejectionReason ?? comments).trim() : equipment === selected ? comments : equipment.admin_comments || '' });
      toast.success(decision === 'approved' ? 'Equipamento aprovado e publicado em Locação de Equipamentos!' : 'Equipamento rejeitado');
      setSelected(null);setRejectionItem(null);setRejectionReason('');
      window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'product', action: decision } }));
      localStorage.setItem('admin_content_updated', Date.now().toString());
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível salvar a aprovação'); }
    finally { inFlight.current = false; setSaving(false); }
  };

  const deleteEquipment = async (equipment: Equipment) => {
    if (equipment.approval_status !== 'rejected' || inFlight.current) return;
    if (!(await appConfirm(`Excluir definitivamente o equipamento "${equipment.title}"? Esta ação não pode ser desfeita.`))) return;
    inFlight.current = true; setSaving(true);
    try {
      await request(`/admin/rental-equipment/${equipment.id}`, 'DELETE');
      if (selected?.id === equipment.id) setSelected(null);
      toast.success('Equipamento excluído com sucesso');
      window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'product', action: 'delete' } }));
      localStorage.setItem('admin_content_updated', Date.now().toString());
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível excluir o equipamento'); }
    finally { inFlight.current = false; setSaving(false); }
  };

  return <AdminLayout title="Equipamentos para Alugar">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {([{key:'all',label:'Total',Icon:Truck,color:'text-blue-600'},{key:'pending',label:'Pendentes',Icon:Clock,color:'text-yellow-600'},{key:'approved',label:'Aprovados',Icon:CheckCircle,color:'text-green-600'},{key:'rejected',label:'Rejeitados',Icon:XCircle,color:'text-red-600'}] as const).map(({key,label,Icon,color})=><div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className={`text-2xl font-bold ${key==='all'?'text-gray-900 dark:text-white':color}`}>{loading?'...':stats[key]}</p></div><Icon className={`h-8 w-8 ${color}`}/></div></div>)}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"/><Input aria-label="Buscar equipamentos" placeholder="Buscar equipamento, categoria ou proprietário..." className="w-full pl-10 pr-4 py-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select aria-label="Filtrar por aprovação" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}}><option value="all">Todos os Status</option>{Object.entries(labels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
          <button type="button" onClick={()=>void load()} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"><Filter className="h-4 w-4 mr-2"/>Atualizar</button>
        </div>
      </div>
      {error ? <div role="alert" className="p-4 rounded-lg bg-red-50 text-red-700">{error} <button className="underline ml-2" onClick={() => void load()}>Tentar novamente</button></div>
        : loading ? <p role="status">Carregando equipamentos...</p>
        : <>
          <p className="text-sm text-gray-500">{count} equipamento(s) encontrado(s)</p>
          <div className="overflow-x-auto rounded-lg border shadow-sm bg-white dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{['Equipamento', 'Proprietário', 'Categoria', 'Diária', 'Aprovação', 'Ações'].map(title => <th key={title} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{title}</th>)}</tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum equipamento encontrado.</td></tr> : items.map(item => <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4"><div className="flex items-center gap-3">{item.images?.[0] && <img src={item.images[0]} alt="" className="w-14 h-14 rounded object-cover" />}<span className="font-medium min-w-32">{item.title}</span></div></td>
                <td className="px-6 py-4">{ownerName(item)}</td><td className="px-6 py-4">{item.category}</td><td className="px-6 py-4 whitespace-nowrap">{money(item.price)}</td>
                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[item.approval_status || 'pending']}`}>{item.approval_status==='approved'?<CheckCircle className="w-4 h-4"/>:item.approval_status==='rejected'?<XCircle className="w-4 h-4"/>:<Clock className="w-4 h-4"/>}{labels[item.approval_status || 'pending']}</span></td>
                <td className="px-6 py-4"><div className="flex flex-wrap gap-2"><button type="button" disabled={saving} title="Ver detalhes" aria-label={`Ver detalhes de ${item.title}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 disabled:opacity-50" onClick={()=>{setSelected(item);setComments(item.admin_comments || '');}}><Eye className="h-4 w-4"/></button>{(!item.approval_status || item.approval_status==='pending') && <><button type="button" disabled={saving} title="Aprovar equipamento" aria-label={`Aprovar equipamento ${item.title}`} className="text-green-600 hover:text-green-900 disabled:opacity-50" onClick={()=>void review('approved',item)}><Check className="h-4 w-4"/></button><button type="button" disabled={saving} title="Rejeitar equipamento" aria-label={`Rejeitar equipamento ${item.title}`} className="text-red-600 hover:text-red-900 disabled:opacity-50" onClick={()=>openRejection(item)}><X className="h-4 w-4"/></button></>}
{item.approval_status === 'rejected' && <button type="button" disabled={saving} title="Excluir equipamento rejeitado" aria-label={`Excluir equipamento ${item.title}`} className="text-red-600 hover:text-red-900 disabled:opacity-50" onClick={()=>void deleteEquipment(item)}><Trash2 className="h-4 w-4"/></button>}</div></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3"><Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm">Página {page + 1} de {Math.max(1, Math.ceil(count / 20))}</span><Button variant="outline" disabled={(page + 1) * 20 >= count} onClick={() => setPage(page + 1)}>Próxima</Button></div>
        </>}
    </div>
    <Dialog open={!!selected} onOpenChange={open => { if (!open && !saving) setSelected(null); }}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl">
        <DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>Detalhes do equipamento e decisão do administrador</DialogDescription></DialogHeader>
        {selected && <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{selected.images?.map((src, index) => <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`Foto ${index + 1} de ${selected.title}`} className="w-full h-36 object-cover rounded-lg" /></a>)}</div>
          <p className="whitespace-pre-wrap">{(selected.description || '').replace(/^\[LOCAÇÃO\]\s*/, '')}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {Object.entries({ Categoria: selected.category, Diária: money(selected.price), Condição: selected.condition, 'Ano de fabricação': selected.manufacturing_date?.slice(0, 4), Proprietário: ownerName(selected), 'Tipo de proprietário': selected.seller_type === 'business' ? 'Empresa' : 'Pessoa física', 'E-mail': selected.seller_info?.businessEmail || selected.seller_info?.email, Telefone: selected.seller_info?.businessPhone || selected.seller_info?.phone, Cidade: selected.seller_info?.businessCity || selected.seller_info?.city, Estado: selected.seller_info?.businessState || selected.seller_info?.state, Cadastro: new Date(selected.created_at).toLocaleDateString('pt-BR'), Aprovação: labels[selected.approval_status || 'pending'] }).map(([key, value]) => <div key={key}><dt className="text-gray-500">{key}</dt><dd className="font-medium break-words">{value || 'Não informado'}</dd></div>)}
          </dl>
          <div><label htmlFor="rental-comments" className="text-sm font-medium">Observações do administrador (obrigatório para rejeitar)</label><textarea id="rental-comments" className="mt-2 w-full border rounded-md p-3 bg-transparent" rows={3} value={comments} onChange={e => setComments(e.target.value)} disabled={saving} /></div>
          <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={saving} onClick={() => setSelected(null)}>Fechar</Button>{selected.approval_status === 'rejected' && <Button variant="destructive" disabled={saving} onClick={() => void deleteEquipment(selected)}><Trash2 className="w-4 h-4 mr-2" />Excluir equipamento</Button>}<Button variant="destructive" disabled={saving || selected.approval_status === 'rejected'} onClick={() => openRejection(selected)}>Rejeitar</Button><Button className="bg-green-600 hover:bg-green-700" disabled={saving || selected.approval_status === 'approved'} onClick={() => void review('approved')}>{saving ? 'Salvando...' : 'Aprovar e publicar'}</Button></div>
        </div>}
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(rejectionItem)} onOpenChange={open=>{if(!open && !saving)setRejectionItem(null);}}>
      <DialogContent className="max-w-lg" onEscapeKeyDown={event=>{if(saving)event.preventDefault();}} onPointerDownOutside={event=>{if(saving)event.preventDefault();}}>
        <DialogHeader><DialogTitle>Rejeitar equipamento</DialogTitle><DialogDescription>Informe o motivo da rejeição de {rejectionItem?.title || 'este equipamento'}.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={event=>{event.preventDefault();if(rejectionItem)void review('rejected',rejectionItem,rejectionReason);}}>
          <label htmlFor="equipment-rejection-reason" className="block text-sm font-medium">Motivo da rejeição *</label>
          <textarea id="equipment-rejection-reason" required autoFocus maxLength={2000} rows={4} disabled={saving} value={rejectionReason} onChange={event=>setRejectionReason(event.target.value)} className="w-full rounded-lg border p-3 bg-transparent" placeholder="Explique por que o equipamento está sendo rejeitado"/>
          <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={()=>setRejectionItem(null)} className="rounded-lg border px-4 py-2">Cancelar</button><button type="submit" disabled={saving || !rejectionReason.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">{saving?'Salvando...':'Confirmar rejeição'}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </AdminLayout>;
}
