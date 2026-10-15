import { toast as sonner } from 'sonner';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';
import type { ReactNode } from 'react';

type Toast = ToastProps & { title?: ReactNode; description?: ReactNode; action?: ToastActionElement };
function toast(props: Toast) {
 let saved = props;
 const show = (id?: string | number) => {
  const options = { id, description: saved.description, action: saved.action, duration: 4000, onDismiss: () => saved.onOpenChange?.(false) };
  const title = saved.title || 'Aviso';
  if(saved.variant === 'destructive') return sonner.error(title, options);
  const text = typeof title === 'string' ? title.toLowerCase() : '';
  if(/sucesso|concluíd|excluído|atualizad|salvo|aprovad/.test(text)) return sonner.success(title, options);
  return sonner.info(title, options);
 };
 const id = show();
 return { id: String(id), dismiss: () => sonner.dismiss(id), update: (next: Partial<Toast>) => { saved = {...saved,...next}; show(id); } };
}
function useToast() { return { toast, dismiss: (id?: string | number) => sonner.dismiss(id), toasts: [] }; }
export { useToast, toast };
