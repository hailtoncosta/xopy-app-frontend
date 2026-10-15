import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, springClient } from '@/integrations/api/client';
export default function ChangePassword() {
 const [currentPassword,setCurrent]=useState(''); const [newPassword,setNew]=useState(''); const [confirm,setConfirm]=useState('');
 const [show,setShow]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const navigate=useNavigate();
 async function submit(e: React.FormEvent) {
  e.preventDefault();if(newPassword!==confirm){setMessage('As senhas não coincidem.');return;}setBusy(true);setMessage('');
  try { await request('/auth/password','PUT',{currentPassword,newPassword});await springClient.auth.signOut();navigate('/auth'); }
  catch(e){setMessage(e instanceof Error?e.message:'Não foi possível alterar a senha');}finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-lg p-6"><h1 className="mb-4 text-2xl font-bold">Alterar senha</h1>
  <form onSubmit={submit} className="space-y-4">
   <label className="block">Senha atual<input autoComplete="current-password" type={show?'text':'password'} required value={currentPassword} onChange={e=>setCurrent(e.target.value)} className="mt-1 block w-full rounded border p-3" /></label>
   <label className="block">Nova senha<input autoComplete="new-password" type={show?'text':'password'} required minLength={8} maxLength={72} value={newPassword} onChange={e=>setNew(e.target.value)} className="mt-1 block w-full rounded border p-3" /></label>
   <label className="block">Confirmar nova senha<input autoComplete="new-password" type={show?'text':'password'} required value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 block w-full rounded border p-3" /></label>
   <label className="block"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)} /> Mostrar senhas</label>
   {message&&<p role="alert" className="text-red-600">{message}</p>}
   <button disabled={busy} className="rounded bg-orange-600 px-4 py-3 text-white">{busy?'Salvando…':'Salvar nova senha'}</button>
   <p className="text-sm">Após a alteração, faça login novamente.</p>
  </form></main>;
}
