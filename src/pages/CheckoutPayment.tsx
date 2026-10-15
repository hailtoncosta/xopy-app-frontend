import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { request } from '@/integrations/api/client';

type Group = { seller_id?: string; sellerName: string; status: string; amount: number; checkout_url?: string; receivingEnabled?: boolean; legacy?: boolean; historical?: boolean };
type Payment = { amount: number; enabled: boolean; groups: Group[]; refreshErrors?: string[] };
const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const labels: Record<string, string> = { not_started: 'Aguardando pagamento', ready: 'Pronto para pagar', pending: 'Aguardando confirmação do Mercado Pago', approved: 'Pagamento aprovado', refunded: 'Pagamento reembolsado', charged_back: 'Pagamento contestado', creating: 'Preparando pagamento', review_required: 'Pagamento precisa de verificação', duplicate_review: 'Pagamento adicional em análise', closed: 'Pedidos encerrados' };
export default function CheckoutPayment() {
  const { checkoutId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rental = params.get('rental') === '1';
  const back = rental ? '/solicitacoes-aluguel?view=sent' : '/pedidos';
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const lock = useRef(false);
  const load = useCallback(async (refresh = false): Promise<Payment> => request(`/payments/checkouts/${checkoutId}${refresh ? '/refresh' : ''}`, refresh ? 'POST' : 'GET', refresh ? {} : undefined), [checkoutId]);
  useEffect(() => {
    let current = true;
    setLoading(true); setPayment(null); setError('');
    load().then(async data => {
      if (current) setPayment(data);
      // Return parameters never confirm payment. Consult the gateway for each seller.
      if (data.enabled && data.groups.some(g => !['not_started', 'closed'].includes(g.status))) {
        const updated = await load(true); if (current) setPayment(updated);
      }
    }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [load]);
  const polling = !!payment?.enabled && payment.groups.some(g => ['pending', 'creating'].includes(g.status));
  useEffect(() => {
    if (!polling) return;
    let current = true;
    const timer = window.setInterval(async () => {
      if (lock.current || document.hidden) return;
      lock.current = true;
      try { const data = await load(true); if (current) { setPayment(data); setError(''); } }
      catch (e) { if (current) setError(e instanceof Error ? e.message : 'Não foi possível atualizar.'); }
      finally { lock.current = false; }
    }, 15000);
    return () => { current = false; window.clearInterval(timer); };
  }, [polling, load]);
  const refresh = async () => {
    if (lock.current) return;
    lock.current = true; setBusy('refresh'); setError('');
    try { setPayment(await load(true)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível consultar o pagamento.'); }
    finally { lock.current = false; setBusy(null); }
  };
  const pay = async (seller: string) => {
    if (lock.current) return;
    lock.current = true; setBusy(seller); setError('');
    try {
      const group: Group = await request(`/payments/checkouts/${checkoutId}/start?seller=${encodeURIComponent(seller)}`, 'POST', {});
      if (group.checkout_url && group.status === 'ready') {
        const url = new URL(group.checkout_url);
        if (url.protocol !== 'https:' || !(url.hostname === 'mercadopago.com.br' || url.hostname.endsWith('.mercadopago.com.br'))) throw new Error('Endereço de pagamento inválido.');
        window.location.assign(url.href);
      } else setPayment(await load());
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível abrir o pagamento.'); }
    finally { lock.current = false; setBusy(null); }
  };
  return <div className="min-h-screen bg-orange-50/40">
    <header className="flex items-center gap-3 border-b bg-white p-4"><button aria-label="Voltar" onClick={() => navigate(back)}><ArrowLeft /></button><h1 className="text-xl font-bold">Pagamento</h1></header>
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-6"><section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex gap-3 text-orange-600"><QrCode size={32} /><CreditCard size={32} /></div>
      <h2 className="text-2xl font-bold">Pix e cartão</h2><p className="mt-2 text-sm text-gray-600">{rental ? 'Pague seu aluguel aprovado com Pix ou cartão. O pagamento será recebido na conta Mercado Pago do Xopy.' : 'Os pagamentos são recebidos na conta Mercado Pago do Xopy. Os valores permanecem identificados por vendedor.'}</p>
      {loading && <p className="mt-6" role="status">Consultando sua compra...</p>}
      {payment && <><p className="mt-6 text-sm text-gray-600">Total da compra</p><p className="text-3xl font-bold">{money(payment.amount)}</p>
        {!payment.enabled && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">O Xopy ainda precisa ativar a integração. Seus pedidos estão salvos para você retornar e pagar.</p>}
        <div className="mt-6 space-y-4">{payment.groups.map((group, index) => <article key={group.seller_id || `legacy-${index}`} className="rounded-2xl border border-orange-100 p-4 sm:p-5">
          <div className="flex flex-wrap justify-between gap-2"><h3 className="min-w-0 break-words font-semibold">{group.sellerName}</h3><p className="font-bold">{money(group.amount)}</p></div>
          <p className="mt-2 text-sm" role="status">{labels[group.status] || 'Consulte o andamento do pagamento'}</p>
          {group.status === 'approved' && <div className="mt-3 flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={20} />Pedidos deste vendedor pagos.</div>}
          {group.historical && <p className="mt-3 text-sm text-amber-900">Pagamento iniciado anteriormente na conta do vendedor. Atualize o status ou procure o Xopy antes de pagar novamente.</p>}
          {group.legacy && <p className="mt-3 text-sm text-amber-900">Esta compra foi iniciada no modelo anterior. Procure o Xopy antes de realizar outro pagamento.</p>}
          {!group.legacy && !group.historical && !group.receivingEnabled && ['not_started', 'ready'].includes(group.status) && <p className="mt-3 text-sm text-amber-900">O Xopy precisa configurar sua conta Mercado Pago para liberar os pagamentos.</p>}
          {['review_required', 'creating', 'duplicate_review'].includes(group.status) && <p className="mt-3 text-sm text-gray-600">Consulte novamente. Se este estado persistir, entre em contato com o Xopy antes de tentar outro pagamento.</p>}
          {payment.enabled && !group.legacy && !group.historical && group.seller_id && group.receivingEnabled && ['not_started', 'ready'].includes(group.status) && <button onClick={() => pay(group.seller_id!)} disabled={!!busy} className="mt-4 w-full rounded-xl bg-orange-600 p-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy === group.seller_id ? 'Abrindo pagamento...' : (rental ? 'Pagar aluguel' : 'Pagar ao Xopy')}</button>}
        </article>)}</div>
        {payment.refreshErrors?.length ? <p role="alert" className="mt-4 text-sm text-amber-900">{payment.refreshErrors[0]}</p> : null}
        {payment.enabled && <button onClick={refresh} disabled={!!busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 p-3 text-orange-700 disabled:opacity-50"><RefreshCw size={18} />{busy === 'refresh' ? 'Consultando...' : 'Atualizar pagamentos'}</button>}
      </>}
      {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={refresh} disabled={!!busy} className="ml-2 underline">Tentar consultar novamente</button></div>}
      <p className="mt-6 flex items-start gap-2 text-xs text-gray-500"><ShieldCheck className="shrink-0" size={17} />O QR Code Pix e os dados do cartão são apresentados no ambiente do Mercado Pago. O recebimento é confirmado na conta do Xopy.</p>
      <button onClick={() => navigate(back)} className="mt-5 text-sm text-orange-700">{rental ? 'Ver minhas solicitações' : 'Ver meus pedidos'}</button>
    </section></main>
  </div>;
}
