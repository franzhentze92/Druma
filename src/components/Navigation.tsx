import React, { useState } from 'react';
import { 
  Home, 
  Activity, 
  MessageCircle, 
  ShoppingBag, 
  Heart, 
  Settings,
  Package,
  Clock,
  Stethoscope,
  Bell,
  Plus,
  Utensils,
  Calendar,
  X
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Navigation: React.FC = () => {
  const { activeSection, setActiveSection } = useAppContext();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'from-blue-500 to-purple-600' },
    { id: 'trazabilidad', label: 'Ejercicio', icon: Activity, color: 'from-green-500 to-teal-600' },
    { id: 'feeding-schedules', label: 'Nutrición', icon: Clock, color: 'from-emerald-500 to-green-600' },
    { id: 'veterinaria', label: 'Veterinaria', icon: Stethoscope, color: 'from-red-500 to-pink-600' },
    { id: 'recordatorios', label: 'Recordatorios', icon: Bell, color: 'from-purple-500 to-indigo-600' },
    { id: 'parejas', label: 'Parejas', icon: Heart, color: 'from-pink-500 to-purple-600' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'from-orange-500 to-red-600' },
    { id: 'orders', label: 'Órdenes', icon: Package, color: 'from-indigo-500 to-blue-600' },
    { id: 'adopcion', label: 'Adopción', icon: Heart, color: 'from-purple-500 to-pink-600' },
    { id: 'ajustes', label: 'Ajustes', icon: Settings, color: 'from-gray-500 to-slate-600' },
  ];

  const quickActions = [
    {
      id: 'exercise',
      label: 'Ejercicio',
      icon: Activity,
      color: 'from-green-500 to-teal-600',
      action: () => {
        setActiveSection('trazabilidad');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Ejercicio');
      }
    },
    {
      id: 'feeding',
      label: 'Comida',
      icon: Utensils,
      color: 'from-emerald-500 to-green-600',
      action: () => {
        setActiveSection('feeding-schedules');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Nutrición');
      }
    },
    {
      id: 'veterinary',
      label: 'Veterinaria',
      icon: Stethoscope,
      color: 'from-red-500 to-pink-600',
      action: () => {
        setActiveSection('veterinaria');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Veterinaria');
      }
    },
    {
      id: 'reminder',
      label: 'Recordatorio',
      icon: Bell,
      color: 'from-purple-500 to-indigo-600',
      action: () => {
        setActiveSection('recordatorios');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Recordatorios');
      }
    },
    {
      id: 'shopping',
      label: 'Comprar',
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-600',
      action: () => {
        setActiveSection('marketplace');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Marketplace');
      }
    },
    {
      id: 'booking',
      label: 'Servicio',
      icon: Calendar,
      color: 'from-blue-500 to-purple-600',
      action: () => {
        setActiveSection('marketplace');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Marketplace para servicios');
      }
    },
    {
      id: 'adopt',
      label: 'Adoptar',
      icon: Heart,
      color: 'from-pink-500 to-purple-600',
      action: () => {
        setActiveSection('adopcion');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Adopción');
      }
    },
    {
      id: 'breeding',
      label: 'Parejas',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      action: () => {
        setActiveSection('parejas');
        setIsQuickActionsOpen(false);
        toast.success('Redirigiendo a Parejas');
      }
    }
  ];

  return (
    <>
      {/* Quick Actions Overlay */}
      {isQuickActionsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsQuickActionsOpen(false)} />
      )}

      {/* Quick Actions Menu */}
      {isQuickActionsOpen && (
        <div className="fixed bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 md:p-4 max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all duration-200 bg-gradient-to-r ${action.color} text-white hover:opacity-90 transform hover:scale-105`}
                >
                  <action.icon size={20} className="mb-1 md:mb-2" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around items-center py-1 md:py-2 px-1">
          {/* First half of navigation items */}
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex flex-col items-center justify-center p-1 md:p-2 rounded-xl transition-all duration-200 min-w-0 flex-1
                ${activeSection === item.id 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <item.icon size={18} className="mb-0.5 md:mb-1" />
              <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
            </button>
          ))}
          
          {/* Quick Actions Button - Center */}
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className={`
              flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-all duration-200 relative mx-1 md:mx-2
              ${isQuickActionsOpen 
                ? 'bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg transform scale-105' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600'
              }
            `}
          >
            {isQuickActionsOpen ? (
              <X size={20} className="mb-0.5 md:mb-1" />
            ) : (
              <Plus size={20} className="mb-0.5 md:mb-1" />
            )}
            <span className="text-xs font-medium leading-tight">Acciones</span>
          </button>
          
          {/* Second half of navigation items */}
          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex flex-col items-center justify-center p-1 md:p-2 rounded-xl transition-all duration-200 min-w-0 flex-1
                ${activeSection === item.id 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <item.icon size={18} className="mb-0.5 md:mb-1" />
              <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;