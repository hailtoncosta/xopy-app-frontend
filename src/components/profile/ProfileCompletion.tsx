import { supabase } from '@/integrations/supabase/client';
import { request } from '@/integrations/api/client';
import { CurrencyInput } from '@/components/ui/currency-input';
import { MaskedInput } from '@/components/ui/masked-input';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRoundPen, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { emptyProfileDetails, ProfileDetails } from '@/lib/profileDetails';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
export default function ProfileCompletion() {
 const { user, isLoading, completeProfile } = useAuth();
 const provider = user?.type === 'service_provider' || user?.type === 'provider';
 const location = useLocation(); const navigate = useNavigate();
 const [editingProfessional, setEditingProfessional] = useState(false);
 const [noticeClosed, setNoticeClosed] = useState(false);
 const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
 const [form, setForm] = useState<ProfileDetails>(emptyProfileDetails);
 useEffect(() => {
  setOpen(false);setNoticeClosed(false);
  setOpen(Boolean(user && provider && !user.profileCompleted));
  setForm({...emptyProfileDetails, name:user?.name || '',phone:user?.phone || '',...user?.profileDetails});
 }, [user?.id]);
 useEffect(() => {
  if(user && new URLSearchParams(location.search).get('action') === 'complete') { show(); const query=new URLSearchParams(location.search);query.delete('action');navigate({pathname:location.pathname,search:query.toString()},{replace:true}); }
 }, [user?.id,location.search]);
 const show = async (editProfessional=false) => {
  if(!user) return;
  setEditingProfessional(editProfessional);
  setForm({...emptyProfileDetails,name:user.name,phone:user.phone || '',...user.profileDetails});
  setOpen(true);setBusy(true);
  try { const result=await request('/profile-details');setForm({...emptyProfileDetails,name:user.name,phone:user.phone || '',...result.details}); }
  catch(e) {setOpen(false);toast.error(e instanceof Error?e.message:'Não foi possível carregar seu cadastro');}
  finally {setBusy(false);}
 };
 useEffect(() => {
  const handler = (event: Event) => show(Boolean((event as CustomEvent).detail?.editProfessional));
  window.addEventListener('xopy:complete-profile', handler);
  return () => window.removeEventListener('xopy:complete-profile', handler);
 }, [user]);
 const field = (key: keyof ProfileDetails, label: string, maxLength: number, placeholder?: string, numeric=false) => <div className="min-w-0 flex flex-col gap-2">
  <Label className="min-h-5" htmlFor={'profile-'+key}>{label} *</Label>
  {key === 'taxId' || key === 'phone' ? <MaskedInput className="h-11 w-full" mask={key === 'phone' ? 'phone' : form.type === 'business' ? 'cnpj' : 'cpf'} id={'profile-'+key} value={form[key]} required disabled={busy} onChange={e=>{const value=e.target.value;setForm(prev=>({...prev,[key]:value}));}} /> : <Input className="h-11 w-full" id={'profile-'+key} value={form[key]} maxLength={maxLength} placeholder={placeholder} inputMode={numeric?'numeric':undefined} required disabled={busy} onChange={e=>setForm(prev=>({...prev,[key]:numeric?e.target.value.replace(/\D/g,''):e.target.value}))} />}
 </div>;
 const professionalText = (key: keyof ProfileDetails, label: string, maxLength=2000) => <div className="space-y-2"><Label htmlFor={'professional-'+key}>{label}</Label><textarea id={'professional-'+key} disabled={busy} maxLength={maxLength} className="w-full rounded-xl border bg-background p-3 min-h-20" value={form[key] || ''} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))}/></div>;
 const uploadPortfolio = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files=Array.from(event.target.files || []);event.target.value='';if(!user || busy || !files.length)return;
  const existing=(form.portfolioPhotos || '').split('\n').filter(Boolean);
  if(existing.length+files.length>12){toast.error('A galeria permite até 12 fotos.');return;}
  if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)){toast.error('Use fotos JPG, PNG ou WebP de até 5 MB.');return;}
  setBusy(true);const uploaded:string[]=[];const urls:string[]=[];
  const bucket=supabase.storage.from('portfolio-images');
  try {
   for(const file of files){const bitmap=await createImageBitmap(file);bitmap.close();const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';const path=user.id+'/'+crypto.randomUUID()+'.'+extension;const result=await bucket.upload(path,file);if(result.error)throw new Error(result.error.message);uploaded.push(path);urls.push(bucket.getPublicUrl(path).data.publicUrl);}
   setForm(prev=>({...prev,portfolioPhotos:[...existing,...urls].join('\n')}));toast.success('Fotos adicionadas. Salve as alterações para concluir.');
  } catch(e){if(uploaded.length)await bucket.remove(uploaded);toast.error(e instanceof Error?e.message:'Não foi possível enviar as fotos');}
  finally {setBusy(false);}
 };
 const save = async (event: React.FormEvent) => {
  event.preventDefault();if(busy) return;setBusy(true);
  try { await completeProfile(form);setOpen(false);toast.success(editingProfessional ? 'Perfil profissional atualizado com sucesso!' : 'Cadastro concluído com sucesso!'); }
  catch(e) {toast.error(e instanceof Error?e.message:'Não foi possível concluir o cadastro');}
  finally {setBusy(false);}
 };
 if(!user || isLoading) return null;
 return <>
  {!user.profileCompleted && !noticeClosed && <div className="xopy-floating-notice fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-40 flex items-center gap-2 p-4 pr-10">
   <button type="button" onClick={()=>show()} className="flex flex-1 items-center gap-3 text-left">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><UserRoundPen size={23} /></span>
    <span className="flex-1"><span className="block font-semibold">Conclua seu cadastro</span><span className="block text-xs text-white/95">Clique para preencher suas informações.</span></span><ChevronRight size={20}/>
   </button>
   <button type="button" aria-label="Fechar aviso de cadastro" onClick={()=>setNoticeClosed(true)} className="xopy-notice-close absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border border-white/30 bg-white/15 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={15}/></button>
  </div>}
  <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}>
   <DialogContent className="max-w-xl rounded-3xl max-h-[90dvh] overflow-y-auto" onEscapeKeyDown={e=>{if(busy)e.preventDefault();}} onPointerDownOutside={e=>{if(busy)e.preventDefault();}}>
    <DialogHeader><DialogTitle className="text-xl">{provider ? (editingProfessional ? 'Editar perfil profissional' : 'Concluir cadastro de prestador') : 'Suas informações'}</DialogTitle><DialogDescription>Complete seus dados para manter o cadastro atualizado.</DialogDescription></DialogHeader>
    <form onSubmit={save} className="space-y-4">
     {!provider && <div className="min-w-0 flex flex-col gap-2"><Label className="min-h-5" htmlFor="profile-type">Tipo de cadastro</Label><select id="profile-type" className="h-11 w-full rounded-xl border bg-background px-3" disabled={busy} value={form.type} onChange={e=>setForm(prev=>({...prev,type:e.target.value as ProfileDetails['type'],taxId:''}))}><option value="individual">Pessoa física</option><option value="business">Empresa</option></select></div>}
     {field('name','Nome completo',150,'Seu nome completo')}
     <div className="min-w-0 flex flex-col gap-2"><Label className="min-h-5" htmlFor="profile-email">E-mail da conta</Label><Input className="h-11 w-full" id="profile-email" value={user.email} readOnly disabled /></div>
     {provider ? <>
      <h3 className="font-semibold border-b pb-2">Identificação</h3>
      {professionalText('nickname','Apelido',150)}
      {professionalText('profession','Profissão',150)}
      {field('phone','Telefone com DDD',11)}
      <div className="space-y-2"><Label htmlFor="provider-category">Categoria *</Label><select id="provider-category" required disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3" value={form.category || ''} onChange={e=>setForm(prev=>({...prev,category:e.target.value}))}><option value="">Selecione</option>{[['arquiteto','Arquiteto'],['eletricista','Eletricista'],['encanador','Encanador'],['engenheiro','Engenheiro'],['jardineiro','Jardineiro'],['marceneiro','Marceneiro'],['pedreiro','Pedreiro'],['pintor','Pintor']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="provider-experience">Experiência *</Label><select id="provider-experience" required disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3" value={form.experience || ''} onChange={e=>setForm(prev=>({...prev,experience:e.target.value}))}><option value="">Selecione</option>{[['iniciante','Iniciante (até 2 anos)'],['intermediario','Intermediário (2-5 anos)'],['experiente','Experiente (5-10 anos)'],['especialista','Especialista (mais de 10 anos)']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="provider-rate">Valor por Dia (R$) *</Label><CurrencyInput id="provider-rate" required disabled={busy} value={form.dailyRate || ''} onChange={e=>setForm(prev=>({...prev,dailyRate:e.target.value}))}/></div>
      {(['city','neighborhood','address'] as const).map((key,index)=><div key={key} className="space-y-2"><Label htmlFor={'provider-'+key}>{['Cidade','Bairro','Endereço'][index]}</Label><Input id={'provider-'+key} disabled={busy} maxLength={key==='address'?500:100} value={form[key] || ''} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))}/></div>)}
      <div className="space-y-2"><Label htmlFor="provider-description">Descrição do Trabalho</Label><textarea id="provider-description" disabled={busy} maxLength={5000} className="w-full rounded-xl border bg-background p-3" value={form.description || ''} onChange={e=>setForm(prev=>({...prev,description:e.target.value}))}/></div>
      <div className="space-y-2"><Label htmlFor="provider-specialties">Especialidades</Label><Input id="provider-specialties" disabled={busy} maxLength={1000} value={form.specialties || ''} onChange={e=>setForm(prev=>({...prev,specialties:e.target.value}))}/></div>
      <h3 className="font-semibold border-b pb-2">Qualificação e Segurança</h3>
      <div className="space-y-2"><Label htmlFor="professional-taxId">CPF/CNPJ</Label><MaskedInput id="professional-taxId" mask="cpf-cnpj" disabled={busy} value={form.taxId || ''} onChange={e=>setForm(prev=>({...prev,taxId:e.target.value}))}/></div>
      {professionalText('certification','Certificação')}
      {professionalText('courses','Cursos')}
      {professionalText('previousCompanies','Empresas que trabalhou')}
      {professionalText('experienceTime','Tempo de experiência',150)}
      <h3 className="font-semibold border-b pb-2">Portfólio de trabalhos</h3>
      <div className="space-y-2"><Label htmlFor="portfolio-upload">Galeria de fotos</Label><Input id="portfolio-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={uploadPortfolio}/><p className="text-xs text-gray-500">Até 12 fotos de 5 MB cada.</p><div className="grid grid-cols-3 gap-2">{(form.portfolioPhotos || '').split('\n').filter(Boolean).map((url,index)=><div key={url+index} className="relative"><img src={url} alt={'Foto do trabalho '+(index+1)} className="w-full aspect-square object-cover rounded-lg"/><button type="button" disabled={busy} aria-label={'Remover foto '+(index+1)} className="absolute top-1 right-1 rounded-full bg-white p-1" onClick={()=>setForm(prev=>({...prev,portfolioPhotos:(prev.portfolioPhotos || '').split('\n').filter((_,i)=>i!==index).join('\n')}))}><X size={16}/></button></div>)}</div></div>
      {professionalText('completedServices','Descrição dos serviços já realizados',5000)}
      <h3 className="font-semibold border-b pb-2">Avaliação e reputação</h3>
      <p className="text-sm text-gray-500">Notas e comentários recebidos aparecem no perfil profissional.</p>
      {professionalText('serviceConditions','Disponibilidade e condição de atendimento')}
      {professionalText('schedule','Agenda e disponibilidade')}
     </> : <>
     {form.type==='business' && field('companyName','Nome da empresa',200)}
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('taxId',form.type==='business'?'CNPJ':'CPF',form.type==='business'?14:11,'Somente números',true)}{field('phone','Telefone com DDD',11,'98999999999',true)}</div>
     {field('address','Endereço',500,'Rua, número, complemento e bairro')}
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field('city','Cidade',100)}<div className="min-w-0 flex flex-col gap-2"><Label className="min-h-5" htmlFor="profile-state">Estado *</Label><select id="profile-state" required disabled={busy} className="h-11 w-full rounded-md border bg-background px-3" value={form.state} onChange={e=>setForm(prev=>({...prev,state:e.target.value}))}>{states.map(state=><option key={state} value={state}>{state}</option>)}</select></div></div>
     {field('zipCode','CEP',8,'Somente números',true)}
     </>}
     <div className="flex gap-3 pt-3"><Button type="button" variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={()=>setOpen(false)}>Agora não</Button><Button type="submit" className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700" disabled={busy}>{busy?'Aguarde...':editingProfessional?'Salvar alterações':'Concluir cadastro'}</Button></div>
    </form>
   </DialogContent>
  </Dialog>
 </>;
}
