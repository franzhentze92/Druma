import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import Trazabilidad from './Trazabilidad';
import Veterinaria from './Veterinaria';
import Comunicacion from './Comunicacion';
import Marketplace from './Marketplace';
import Adopcion from './Adopcion';
import Ajustes from './Ajustes';
import ClientOrders from './ClientOrders';
import ProviderOrders from './ProviderOrders';
import ProviderDashboard from './ProviderDashboard';
import ShelterDashboard from './ShelterDashboard';
import FeedingSchedulesPage from '../pages/FeedingSchedulesPage';
import Recordatorios from '../pages/Recordatorios';
import Parejas from '../pages/Parejas';

const AppLayout: React.FC = () => {
  const { activeSection } = useAppContext();
  
  // Get user role to determine which dashboard and components to show
  const userRole = localStorage.getItem('user_role');

  const renderContent = () => {
    // If user is a provider, show ProviderDashboard
    if (userRole === 'provider') {
      return <ProviderDashboard />;
    }
    
    // If user is a shelter, show ShelterDashboard
    if (userRole === 'shelter') {
      return <ShelterDashboard />;
    }
    
    // Default: client dashboard with regular sections
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'trazabilidad':
        return <Trazabilidad />;
      case 'feeding-schedules':
        return <FeedingSchedulesPage />;
      case 'veterinaria':
        return <Veterinaria />;
      case 'recordatorios':
        return <Recordatorios />;
      case 'parejas':
        return <Parejas />;
      case 'comunicacion':
        return <Comunicacion />;
      case 'marketplace':
        return <Marketplace />;
      case 'orders':
        return <ClientOrders />;
      case 'adopcion':
        return <Adopcion />;
      case 'ajustes':
        return <Ajustes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Main Content with bottom padding for navigation */}
      <main className="pb-20">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation - only show for client users */}
      {userRole === 'client' && <Navigation />}
    </div>
  );
};

export default AppLayout;