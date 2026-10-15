import * as React from 'react';
import { Input } from './input';
import { formatMoneyInput, moneyFromDigits } from '@/lib/money';
export const CurrencyInput=React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>(({value,defaultValue,onChange,type,step,min,max,inputMode,...props},ref)=>{
 const [local,setLocal]=React.useState<string|number>(String(defaultValue ?? ''));
 const change=(event:React.ChangeEvent<HTMLInputElement>)=>{
  const normalizedValue=moneyFromDigits(event.currentTarget.value);
  setLocal(normalizedValue);
  const input=event.currentTarget;
  const target=new Proxy(input,{get:(object,key)=>key==='value'?normalizedValue:Reflect.get(object,key,object)});
  const normalized=Object.create(event);
  Object.defineProperties(normalized,{target:{value:target},currentTarget:{value:target}});
  onChange?.(normalized);
 };
 return <Input {...props} ref={ref} type="text" inputMode="numeric" placeholder={props.placeholder || 'R$ 0,00'} value={formatMoneyInput(value as string|number|undefined ?? local)} onChange={change} />;
});
CurrencyInput.displayName='CurrencyInput';
