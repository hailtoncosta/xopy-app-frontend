import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PushNotificationBannerProps {
  permission: NotificationPermission;
  onRequestPermission: () => void;
}

export function PushNotificationBanner({ permission, onRequestPermission }: PushNotificationBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    // Evita “sumir para sempre”: se o usuário dispensou, mostramos novamente depois de 7 dias
    const raw = localStorage.getItem('push-banner-dismissed-until');
    const until = raw ? Number(raw) : 0;
    return Date.now() < until;
  });

  // Don't show if already granted, denied, or dismissed
  if (permission !== 'default' || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('push-banner-dismissed-until', String(Date.now() + sevenDays));
    setDismissed(true);
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-primary/20 p-2 rounded-full">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            <span className="font-medium">Ative as notificações</span> para receber alertas de mensagens e atualizações importantes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onRequestPermission}
            className="whitespace-nowrap"
          >
            Ativar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
