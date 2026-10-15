import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { request } from '@/integrations/api/client';
import { supabase } from '@/integrations/supabase/client';
import { useCart, useAuth } from '@/hooks';
import { toast } from 'sonner';
import { generateUUID } from '@/utils/uuid';

type Quote = { items: { id: string; name: string; price: number; quantity: number; total: number }[]; subtotal: number; shipping: number; total: number };
type Address = { id: string; label?: string; street: string; number: string; city: string; state: string; is_default?: boolean };
const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export default function CheckoutNew({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const direct = new URLSearchParams(location.search).get('direct') === '1';
  const [directItems] = useState<any[]>(() => { try { const saved = JSON.parse(localStorage.getItem('xopy_checkout_item') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; } });
  const { cartItems, removeFromCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [addressId, setAddressId] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const attempt = useRef<{ key: string; id: string } | null>(null);
  const lock = useRef(false);
  const items = (direct ? directItems : cartItems).map(item => ({ id: String(item.id), quantity: item.quantity }));
  const key = JSON.stringify({ items, deliveryType, addressId: deliveryType === 'delivery' ? addressId : null });
  useEffect(() => {
    let current = true;
    supabase.from('user_addresses').select('*').order('is_default', { ascending: false }).then(result => {
      if (!current) return;
      if (result.error) { toast.error('Não foi possível carregar os endereços'); return; }
      const rows = result.data as Address[];
      setAddresses(rows || []); setAddressId(rows?.[0]?.id || '');
    });
    return () => { current = false; };
  }, []);
  useEffect(() => {
    let current = true;
    setQuote(null); setError('');
    if (!items.length) return;
    if (deliveryType === 'delivery' && !addressId) { setError('Cadastre ou selecione um endereço para entrega.'); return; }
    setLoading(true);
    request('/checkout/quote', 'POST', JSON.parse(key)).then(data => { if (current) setQuote(data); }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [key, refresh]);
  const confirm = async () => {
    if (!quote || loading || lock.current) return;
    lock.current = true; setSending(true); setError('');
    const attemptKey = `${user?.id}:${key}`;
    if (!attempt.current || attempt.current.key !== attemptKey) {
      try { attempt.current = JSON.parse(sessionStorage.getItem('xopy-checkout-attempt') || 'null'); } catch { attempt.current = null; }
      if (!attempt.current || attempt.current.key !== attemptKey) attempt.current = { key: attemptKey, id: generateUUID() };
    }
    sessionStorage.setItem('xopy-checkout-attempt', JSON.stringify(attempt.current));
    try {
      await request('/checkout/orders', 'POST', { ...JSON.parse(key), requestId: attempt.current.id, expectedTotal: quote.total });
      if (direct) localStorage.removeItem('xopy_checkout_item');
      else items.forEach(item => removeFromCart(item.id));
      sessionStorage.removeItem('xopy-checkout-attempt');
      toast.success('Pedido registrado. Aguardando pagamento.');
      navigate(`/pagamento/${attempt.current.id}`, { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível registrar o pedido.'); }
    finally { lock.current = false; setSending(false); }
  };
  return <div className="min-h-screen bg-gray-50">
    <header className="flex items-center gap-3 bg-white border-b px-4 py-4"><button aria-label="Voltar ao carrinho" disabled={sending} onClick={() => onBack ? onBack() : navigate('/carrinho')}><ArrowLeft /></button><h1 className="text-xl font-bold">Finalizar compra</h1></header>
    <main className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      {!items.length ? <div className="rounded-2xl bg-white p-8 text-center"><ShoppingBag className="mx-auto mb-4 h-12 w-12 text-orange-500" /><p>Seu carrinho está vazio.</p><button onClick={() => navigate('/')} className="mt-4 text-orange-600">Continuar comprando</button></div> : <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Recebimento</h2><fieldset disabled={sending} className="space-y-3"><label className="flex gap-2 items-center"><input type="radio" name="delivery" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} />Retirar com o vendedor</label><label className="flex gap-2 items-center"><input type="radio" name="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} />Entrega no endereço</label>
          {deliveryType === 'delivery' && <><label className="block text-sm font-medium" htmlFor="address">Endereço de entrega</label><select id="address" className="w-full rounded-lg border p-3" value={addressId} onChange={e => setAddressId(e.target.value)}><option value="">Selecione um endereço</option>{addresses.map(a => <option key={a.id} value={a.id}>{a.label || a.street}, {a.number} — {a.city}/{a.state}</option>)}</select><button type="button" className="text-orange-600 text-sm" onClick={() => navigate('/enderecos')}>Gerenciar endereços</button></>}
        </fieldset><div className="mt-6 rounded-xl bg-orange-50 p-4"><h2 className="font-semibold text-orange-900">Pagamento</h2><p className="mt-2 text-sm text-orange-900">Pague com Pix ou cartão no checkout seguro do Mercado Pago. O pagamento é recebido na conta Mercado Pago do Xopy. Compras com vendedores diferentes terão pagamentos separados, com confirmação em Meus Pedidos.</p></div></section>
        <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Revisão do pedido</h2>{loading && <p role="status">Conferindo preços e estoque...</p>}{quote && <><ul className="space-y-3">{quote.items.map(item => <li key={item.id} className="flex justify-between gap-3 border-b pb-3"><div className="min-w-0 break-words"><p className="font-medium">{item.name}</p><p className="text-sm text-gray-600">{item.quantity} × {money(item.price)}</p></div><span className="shrink-0">{money(item.total)}</span></li>)}</ul><div className="mt-4 space-y-2"><p className="flex justify-between"><span>Produtos</span><span>{money(quote.subtotal)}</span></p><p className="flex justify-between"><span>Frete</span><span>{money(quote.shipping)}</span></p><p className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(quote.total)}</span></p></div></>}
          {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"><p>{error}</p><button disabled={sending} onClick={() => setRefresh(n => n + 1)} className="mt-2 underline">Atualizar revisão</button><button disabled={sending} onClick={() => navigate('/carrinho')} className="ml-3 underline">Editar carrinho</button></div>}
          <button disabled={!quote || loading || sending} onClick={confirm} className="mt-5 w-full rounded-xl bg-orange-600 p-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{sending ? 'Registrando pedido...' : 'Continuar para pagamento'}</button>
        </section></div>}
    </main>
  </div>;
}
