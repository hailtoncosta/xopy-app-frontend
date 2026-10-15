import * as React from 'react';
import { Input } from './input';
import { formatMask, maskDigits, maskLengths, InputMask } from '@/lib/inputMasks';
export interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> { mask: InputMask; }
export const MaskedInput = React.forwardRef<HTMLInputElement,MaskedInputProps>(({mask,value,defaultValue,onChange,onKeyDown,onPaste,maxLength,placeholder,...props},ref)=>{
 const [local,setLocal]=React.useState(defaultValue ?? '');
 const change=(event: React.ChangeEvent<HTMLInputElement>)=>{
  const input=event.currentTarget;
  const cursor=input.selectionStart ?? input.value.length;
  const before=input.value.slice(0,cursor).replace(/\D/g,'').length;
  const digits=maskDigits(mask,input.value),formatted=formatMask(mask,digits);
  setLocal(digits);
  const target=new Proxy(input,{get:(object,key)=>key==='value'?digits:Reflect.get(object,key,object)});
  const normalized=Object.create(event);
  Object.defineProperties(normalized,{target:{value:target},currentTarget:{value:target}});
  onChange?.(normalized);
  requestAnimationFrame(()=>{if(document.activeElement!==input)return;let count=0,pos=0;while(pos<formatted.length&&count<before){if(/\d/.test(formatted[pos]))count++;pos++;}input.setSelectionRange(pos,pos);});
 };
 const paste=(event: React.ClipboardEvent<HTMLInputElement>)=>{
  onPaste?.(event);if(event.defaultPrevented)return;event.preventDefault();
  const input=event.currentTarget,start=input.selectionStart ?? 0,end=input.selectionEnd ?? input.value.length;
  const text=event.clipboardData.getData('text');input.value=input.value.slice(0,start)+text+input.value.slice(end);
  input.setSelectionRange(start+text.length,start+text.length);
  change(event as unknown as React.ChangeEvent<HTMLInputElement>);
 };
 const keydown=(event: React.KeyboardEvent<HTMLInputElement>)=>{
  onKeyDown?.(event);if(event.defaultPrevented)return;
  const input=event.currentTarget,start=input.selectionStart,end=input.selectionEnd;
  if(start===null || start!==end)return;
  if(event.key==='Backspace' && start>0 && /\D/.test(input.value[start-1])) {let pos=start-1;while(pos>0&&/\D/.test(input.value[pos]))pos--;input.setSelectionRange(pos,start);}
  if(event.key==='Delete' && start<input.value.length && /\D/.test(input.value[start])) {let pos=start;while(pos<input.value.length&&/\D/.test(input.value[pos]))pos++;input.setSelectionRange(start,Math.min(pos+1,input.value.length));}
 };
 return <Input {...props} ref={ref} type="tel" inputMode="numeric" value={formatMask(mask,value ?? local)} maxLength={maskLengths[mask]} placeholder={placeholder && !/apenas números|somente números|98999999999|11987654321/i.test(placeholder)?placeholder:mask==='cpf'?'000.000.000-00':mask==='cnpj'?'00.000.000/0000-00':mask==='cpf-cnpj'?'CPF ou CNPJ':mask==='whatsapp'?'+55 (98) 99999-9999':'(98) 99999-9999'} onChange={change} onKeyDown={keydown} onPaste={paste}/>;
});
MaskedInput.displayName='MaskedInput';
