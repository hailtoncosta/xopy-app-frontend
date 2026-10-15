export function parseMoney(value: string | number | null | undefined): number {
 if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
 const raw=String(value ?? '').replace(/R\$/g,'').replace(/\s/g,'');
 const normalized=raw.includes(',')?raw.replace(/\./g,'').replace(',','.'):raw;
 const number=Number(normalized); return Number.isFinite(number)?number:0;
}
export function formatMoneyInput(value: string | number | null | undefined): string {
 if(value==='' || value==null)return '';
 return parseMoney(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
export function moneyFromDigits(value: string): string {
 const digits=value.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,12);
 return digits ? (Number(digits)/100).toFixed(2) : '';
}
