import {useState,useEffect} from 'react';
import {MapPin,Loader2,RefreshCw} from 'lucide-react';
import {useGeolocation} from '@/hooks';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
interface LocationSectionProps {onLocationConfirm?:(location:string)=>void;placeholder?:string;}
const states=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
export default function LocationSection({onLocationConfirm}:LocationSectionProps) {
 const {location,isLoading,error,getCurrentPosition}=useGeolocation({autoRequest:true,watch:true});
 const [open,setOpen]=useState(false);const [city,setCity]=useState('');const [state,setState]=useState('MA');const [manual,setManual]=useState('');
 const value=manual || (location?`${location.city}, ${location.state}`:'');
 useEffect(()=>{if(value)onLocationConfirm?.(value);},[value,onLocationConfirm]);
 return <div className="mb-2">
  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-600"/>{isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}<button type="button" onClick={()=>setOpen(true)} className="text-sm text-gray-700">{value || (isLoading?'Identificando localização...':'Localização não identificada')}</button><button type="button" title="Atualizar localização atual" aria-label="Atualizar localização atual" onClick={()=>{setManual('');void getCurrentPosition();}}><RefreshCw className="h-4 w-4 text-gray-500"/></button></div>
  {manual && <p className="text-xs text-gray-500">Localização informada manualmente</p>}
  {!manual && error && <p role="status" className="text-xs text-gray-500 mt-1">{error} <button type="button" className="underline" onClick={()=>setOpen(true)}>Informar cidade e estado</button></p>}
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Sua localização</DialogTitle><DialogDescription>Use sua localização atual ou informe cidade e estado.</DialogDescription></DialogHeader><Button type="button" onClick={()=>{setManual('');void getCurrentPosition();setOpen(false);}}>Usar localização atual</Button><form className="space-y-3" onSubmit={event=>{event.preventDefault();if(city.trim()){setManual(city.trim()+', '+state);setOpen(false);}}}><label htmlFor="location-city" className="text-sm">Cidade</label><Input id="location-city" required maxLength={100} value={city} onChange={event=>setCity(event.target.value)}/><label htmlFor="location-state" className="text-sm">Estado</label><select id="location-state" value={state} onChange={event=>setState(event.target.value)} className="w-full rounded-lg border p-2">{states.map(value=><option key={value}>{value}</option>)}</select><Button type="submit">Confirmar localização</Button></form></DialogContent></Dialog>
 </div>;
}
