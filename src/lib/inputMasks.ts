export type InputMask = 'cpf' | 'cnpj' | 'cpf-cnpj' | 'phone' | 'whatsapp';
export const maskLengths: Record<InputMask,number> = {cpf:14,cnpj:18,'cpf-cnpj':18,phone:15,whatsapp:19};
export function maskDigits(mask: InputMask, value: unknown): string {
 const raw=String(value ?? ''),digits=raw.replace(/\D/g,'');
 if(mask==='whatsapp') {
  if(!digits) return '';
  const local=digits.startsWith('55') && (digits.length>11 || raw.trim().startsWith('+55')) ? digits.slice(2) : digits;
  return '55'+local.slice(0,11);
 }
 if(mask==='phone' && digits.startsWith('55') && [12,13].includes(digits.length)) return digits.slice(2,13);
 return digits.slice(0,mask==='cpf'?11:mask==='phone'?11:14);
}
function grouped(digits: string, sizes: number[], separators: string[]) {
 let value='',offset=0;
 for(let i=0;i<sizes.length && offset<digits.length;i++){if(i) value+=separators[i-1];value+=digits.slice(offset,offset+sizes[i]);offset+=sizes[i];}
 return value;
}
function phone(value: string) {
 if(!value) return '';
 if(value.length<=2) return '('+value;
 const local=value.slice(2),split=value.length>10?5:4;
 return '('+value.slice(0,2)+') '+local.slice(0,split)+(local.length>split?'-'+local.slice(split):'');
}
export function formatMask(mask: InputMask,value: unknown): string {
 if(mask==='whatsapp') {const d=String(value??'').replace(/\D/g,'');if(!d)return '';return '+55 '+phone((d.startsWith('55')?d.slice(2):d).slice(0,11));}
 const d=maskDigits(mask,value);
 if(mask==='phone')return phone(d);
 if(mask==='cpf'||(mask==='cpf-cnpj'&&d.length<=11))return grouped(d,[3,3,3,2],['.','.','-']);
 return grouped(d,[2,3,3,4,2],['.','.','/','-']);
}
