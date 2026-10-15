import { toast } from 'sonner';

export type Confirmation = { message: string; resolve: (accepted: boolean) => void; trigger?: HTMLElement | null };
let current: Confirmation | null = null;
const listeners = new Set<() => void>();
export const confirmationStore = {
 subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
 snapshot: () => current,
 settle: (accepted: boolean) => { const request = current; current = null; listeners.forEach(fn => fn()); request?.resolve(accepted); if(request?.trigger) setTimeout(() => { if(request.trigger?.isConnected) request.trigger.focus(); }, 0); },
};
export function appConfirm(message: string): Promise<boolean> {
 // Ignore repeat clicks while a decision is already open.
 if (current) return Promise.resolve(false);
 return new Promise(resolve => { current = { message, resolve, trigger: typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null }; listeners.forEach(fn => fn()); });
}
export function appNotify(message: string) {
 const text = message.toLowerCase();
 if (/erro|inválid|falh|não foi possível/.test(text)) return toast.error(message);
 if (/obrigatóri|preencha|já (está|existe)|deve ter|máximo/.test(text)) return toast.warning(message);
 if (/sucesso|atualizad|concluíd|excluído|confirmado/.test(text)) return toast.success(message);
 return toast.info(message);
}
