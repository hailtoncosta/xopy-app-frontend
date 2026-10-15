import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from './NotificationList';

export const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative p-2 hover:bg-orange-700 rounded-full transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showList && (
        <NotificationList onClose={() => setShowList(false)} />
      )}
    </div>
  );
};
