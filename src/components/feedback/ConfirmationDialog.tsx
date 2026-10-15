import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldQuestion, Trash2, XCircle } from 'lucide-react';
import { confirmationStore } from '@/lib/feedback';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

export default function ConfirmationDialog() {
 const confirmation = useSyncExternalStore(confirmationStore.subscribe, confirmationStore.snapshot);
 const location = useLocation();
 useEffect(() => () => confirmationStore.settle(false), [location.pathname]);
 const message = confirmation?.message || '';
 const destructive = /exclu|remover|apagar|limpar/i.test(message);
 const approve = /^aprovar/i.test(message);
 const reject = /^recusar/i.test(message);
 const cancel = /^cancelar/i.test(message);
 const Icon = destructive ? Trash2 : approve ? CheckCircle2 : reject ? XCircle : ShieldQuestion;
 const title = destructive ? 'Confirmar exclusão' : approve ? 'Aprovar aluguel' : reject ? 'Recusar aluguel' : cancel ? 'Cancelar pedido' : 'Confirmar ação';
 const label = destructive ? (/limpar/i.test(message) ? 'Sim, limpar' : /remover/i.test(message) ? 'Sim, remover' : 'Sim, excluir') : approve ? 'Aprovar' : reject ? 'Recusar' : cancel ? 'Sim, cancelar pedido' : 'Confirmar';
 return <AlertDialog open={!!confirmation} onOpenChange={open => { if(!open) confirmationStore.settle(false); }}>
  <AlertDialogContent>
   <AlertDialogHeader>
    <span className={`mb-2 inline-flex h-14 w-14 items-center justify-center self-center rounded-2xl sm:self-start ${destructive || reject || cancel ? 'bg-red-50 text-red-600 dark:bg-red-950/40' : 'bg-orange-50 text-orange-600 dark:bg-orange-950/40'}`}><Icon size={27} strokeWidth={1.8} /></span>
    <AlertDialogTitle>{title}</AlertDialogTitle>
    <AlertDialogDescription className="whitespace-pre-line break-words">{message}</AlertDialogDescription>
   </AlertDialogHeader>
   <AlertDialogFooter>
    <AlertDialogCancel onClick={() => confirmationStore.settle(false)}>{cancel ? 'Manter pedido' : 'Cancelar'}</AlertDialogCancel>
    <AlertDialogAction className={destructive || reject || cancel ? 'bg-red-600 hover:bg-red-700' : undefined} onClick={() => confirmationStore.settle(true)}>{label}</AlertDialogAction>
   </AlertDialogFooter>
  </AlertDialogContent>
 </AlertDialog>;
}
