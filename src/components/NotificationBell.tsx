import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  type: 'feeding' | 'exercise' | 'vet' | 'breeding' | 'adoption' | 'reminder';
  title: string;
  message: string;
  time: Date;
  unread: boolean;
}

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'feeding',
        title: 'Hora de alimentar a Max',
        message: 'Es hora de darle comida a tu perro Max',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        unread: true
      },
      {
        id: 2,
        type: 'exercise',
        title: 'Recordatorio de ejercicio',
        message: 'No has registrado ejercicio hoy. ¡Mantén a tus mascotas activas!',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        unread: true
      },
      {
        id: 3,
        type: 'vet',
        title: 'Cita veterinaria próxima',
        message: 'Tienes una cita con el veterinario mañana a las 10:00 AM',
        time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        unread: false
      },
      {
        id: 4,
        type: 'breeding',
        title: 'Nueva solicitud de pareja',
        message: 'Luna tiene una nueva solicitud de pareja de Bella',
        time: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        unread: false
      },
      {
        id: 5,
        type: 'adoption',
        title: 'Actualización de adopción',
        message: 'Tu solicitud de adopción para Rex ha sido aprobada',
        time: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        unread: false
      },
      {
        id: 6,
        type: 'reminder',
        title: 'Recordatorio de vacunas',
        message: 'Las vacunas de Max están próximas a vencer',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        unread: false
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'bg-orange-500';
      case 'exercise': return 'bg-green-500';
      case 'vet': return 'bg-red-500';
      case 'breeding': return 'bg-pink-500';
      case 'adoption': return 'bg-purple-500';
      case 'reminder': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className={`relative notification-dropdown ${className}`}>
      <Button
        type="button"
        onClick={() => setShowNotifications(!showNotifications)}
        variant="outline"
        size="sm"
        className="bg-white/20 text-white border-white/40 hover:bg-white/30 hover:text-white backdrop-blur-sm p-2"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      
      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
            <p className="text-sm text-gray-500">{notifications.length} notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)} ${
                      notification.unread ? '' : 'opacity-30'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time.toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                }}
              >
                Marcar todas como leídas
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
