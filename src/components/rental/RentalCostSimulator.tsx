import { CurrencyInput } from '@/components/ui/currency-input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { estimateRental, formatRentalMoney as money, parseRentalMoney, rentalPeriods, RentalPeriod } from '@/utils/rentalCost';

export default function RentalCostSimulator({ open, onOpenChange, name, price, shippingCost = 0 }: { open: boolean; onOpenChange: (open: boolean) => void; name: string; price: string; shippingCost?: number }) {
  const [period, setPeriod] = useState<RentalPeriod>('day');
  const [quantity, setQuantity] = useState('1');
  const [freight, setFreight] = useState(String(shippingCost));
  const [start, setStart] = useState(String(shippingCost));
  const daily = parseRentalMoney(price);
  const result = estimateRental(daily, period, Number(quantity), freight.trim() ? parseRentalMoney(freight) : 0);
  let returnDate = '';
  if (result && start) { const date = new Date(`${start}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + result.days); returnDate = date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
    <DialogHeader><DialogTitle>Simulador de custos de locação</DialogTitle><DialogDescription>{name}</DialogDescription></DialogHeader>
    <p className="text-sm">Diária cadastrada: <strong>{Number.isFinite(daily) ? money(daily) : 'Não informada'}</strong></p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 items-start">
      <div className="min-w-0 flex flex-col gap-2"><Label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5" htmlFor="simulation-period">Período</Label><select id="simulation-period" className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={period} onChange={e => setPeriod(e.target.value as RentalPeriod)}>{Object.entries(rentalPeriods).map(([key, value]) => <option key={key} value={key}>{value.label} ({value.days} dia{value.days > 1 ? 's' : ''})</option>)}</select></div>
      <div className="min-w-0 flex flex-col gap-2"><Label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5" htmlFor="simulation-quantity">Quantidade de períodos</Label><Input id="simulation-quantity" type="number" min="1" max="3650" step="1" className="h-11 w-full min-w-0 text-sm" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
      <div className="min-w-0 flex flex-col gap-2"><Label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5" htmlFor="simulation-start">Data de início (opcional)</Label><Input id="simulation-start" type="date" className="h-11 w-full min-w-0 text-sm" value={start} onChange={e => setStart(e.target.value)} /></div>
      <div className="min-w-0 flex flex-col gap-2"><Label className="flex items-end min-h-5 sm:min-h-10 text-sm leading-5" htmlFor="simulation-freight">Frete total estimado (R$)</Label><CurrencyInput id="simulation-freight" inputMode="decimal" placeholder="A combinar" className="h-11 w-full min-w-0 text-sm" value={freight} onChange={e => setFreight(e.target.value)} /><p className="text-xs text-gray-500">Informe o valor de ida e volta.</p></div>
    </div>
    {result ? <div aria-live="polite" className="bg-orange-50 text-gray-900 rounded-xl p-4 space-y-2 text-sm">
      <p className="flex justify-between gap-2"><span>Duração</span><strong>{result.days} dia(s)</strong></p>
      {returnDate && <p className="flex justify-between gap-2"><span>Devolução prevista</span><strong>{returnDate}</strong></p>}
      <p className="flex justify-between gap-2"><span>Locação ({money(daily)} × {result.days} dias)</span><strong>{money(result.subtotal)}</strong></p>
      <p className="flex justify-between gap-2"><span>Frete</span><strong>{freight.trim() ? money(result.freight) : 'A combinar'}</strong></p>
      <p className="flex justify-between gap-2 border-t border-orange-200 pt-3 text-lg"><span>{freight.trim() ? 'Total estimado' : 'Subtotal sem frete'}</span><strong>{money(result.total)}</strong></p>
    </div> : <p role="alert" className="text-sm text-red-600">Informe uma quantidade inteira entre 1 e 3650 e um frete válido, maior ou igual a zero.</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="text-left font-semibold mb-2">Comparação de períodos — 1 unidade, sem frete</caption><thead><tr><th className="text-left py-2">Período</th><th className="text-right">Dias</th><th className="text-right">Locação</th></tr></thead><tbody>{Object.entries(rentalPeriods).map(([key, value]) => <tr key={key} className="border-t"><td className="py-2">{value.label}</td><td className="text-right">{value.days}</td><td className="text-right">{Number.isFinite(daily) && daily >= 0 ? money(daily * value.days) : '—'}</td></tr>)}</tbody></table></div>
    <p className="text-xs text-gray-500">Semana = 7 dias, quinzena = 15 dias e mês = 30 dias. Os valores usam a diária cadastrada, sem descontos automáticos. Confirme o orçamento e o frete com o locador. A simulação não gera reserva ou cobrança.</p>
    <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
  </DialogContent></Dialog>;
}
