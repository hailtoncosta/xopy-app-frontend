export const rentalPeriods = { day: { label: 'Dia', days: 1 }, week: { label: 'Semana', days: 7 }, fortnight: { label: 'Quinzena', days: 15 }, month: { label: 'Mês', days: 30 } };
export type RentalPeriod = keyof typeof rentalPeriods;
export const formatRentalMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function parseRentalMoney(value: string | number): number {
  if (typeof value === 'number') return value;
  const raw = value.replace(/R\$/g, '').trim().replace(/\s/g, '');
  const number = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  return Number(number);
}
export function estimateRental(daily: number, period: RentalPeriod, quantity: number, freight: number = 0) {
  if (!Number.isFinite(daily) || daily < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 3650 || !Number.isFinite(freight) || freight < 0) return null;
  const days = rentalPeriods[period].days * quantity;
  const subtotal = Math.round(daily * days * 100) / 100;
  const shipping = Math.round(freight * 100) / 100;
  return { days, subtotal, freight: shipping, total: Math.round((subtotal + shipping) * 100) / 100 };
}
