import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Utensils, Activity, Stethoscope, Heart, Bell, 
  ShoppingBag, Calendar, Camera, MapPin
} from 'lucide-react';

interface QuickActionsProps {
  onFeed: () => void;
  onWalk: () => void;
  onVet: () => void;
  onPlay: () => void;
  onReminders: () => void;
  onShopping: () => void;
  onSchedule: () => void;
  onPhotos: () => void;
  onLostPets: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onFeed,
  onWalk,
  onVet,
  onPlay,
  onReminders,
  onShopping,
  onSchedule,
  onPhotos,
  onLostPets
}) => {
  const primaryActions = [
    {
      id: 'feed',
      label: 'Alimentar',
      icon: Utensils,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      action: onFeed,
      description: '¡Tu mascota tiene hambre!'
    },
    {
      id: 'walk',
      label: 'Caminar',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      action: onWalk,
      description: '¡Hora de ejercicio!'
    },
    {
      id: 'vet',
      label: 'Veterinario',
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      action: onVet,
      description: 'Cuidado de la salud'
    },
    {
      id: 'play',
      label: 'Jugar',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      action: onPlay,
      description: '¡Momento de diversión!'
    }
  ];

  const secondaryActions = [
    {
      id: 'reminders',
      label: 'Recordatorios',
      icon: Bell,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      action: onReminders,
      description: 'Gestionar alertas'
    },
    {
      id: 'shopping',
      label: 'Compras',
      icon: ShoppingBag,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      action: onShopping,
      description: 'Productos para mascotas'
    },
    {
      id: 'schedule',
      label: 'Horarios',
      icon: Calendar,
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      action: onSchedule,
      description: 'Planificar actividades'
    },
    {
      id: 'photos',
      label: 'Fotos',
      icon: Camera,
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      action: onPhotos,
      description: 'Álbum de recuerdos'
    },
    {
      id: 'lost',
      label: 'Perdidos',
      icon: MapPin,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      action: onLostPets,
      description: 'Mascotas perdidas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {primaryActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.action}
                className={`
                  h-20 flex flex-col items-center justify-center space-y-2
                  bg-gradient-to-r ${action.color} hover:shadow-lg
                  transition-all duration-300 transform hover:scale-105
                  border-0 text-white
                `}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3 text-center">
          Más Opciones
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {secondaryActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.action}
                variant="outline"
                className={`
                  h-16 flex flex-col items-center justify-center space-y-1
                  ${action.bgColor} hover:shadow-md
                  transition-all duration-300 transform hover:scale-105
                  border-0
                `}
              >
                <IconComponent className={`w-5 h-5 ${action.iconColor}`} />
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Action Descriptions */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-purple-800 mb-2">
            💡 <strong>Tip:</strong> Cada acción que hagas hará más feliz a tu mascota
          </p>
          <p className="text-xs text-purple-600">
            Gana PetPoints y desbloquea logros cuidando a tu compañero
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
