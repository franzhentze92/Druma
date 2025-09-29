
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return
    
    // Check if user is authenticated first
    if (!user) {
      console.log('No authenticated user, redirecting to auth')
      navigate('/login')
      return
    }
    
    console.log('Index: Checking role-based routing...')
    console.log('Current pathname:', location.pathname)
    
    // For testing purposes, you can uncomment this line to clear the role and test role selection
    // localStorage.removeItem('user_role');
    
    const role = localStorage.getItem('user_role') as 'client' | 'provider' | 'shelter' | null
    console.log('Stored role:', role)
    
    if (!role) {
      console.log('No role found, redirecting to role selection')
      navigate('/role')
      return
    }
    
    // Only redirect if we're not already on the correct route
    if (role === 'provider' && location.pathname !== '/provider') {
      console.log('Provider role detected, redirecting to provider dashboard')
      navigate('/provider')
      return
    }
    if (role === 'shelter' && location.pathname !== '/shelter-dashboard') {
      console.log('Shelter role detected, redirecting to shelter dashboard')
      navigate('/shelter-dashboard')
      return
    }
    if (role === 'client' && location.pathname !== '/client-dashboard' && location.pathname !== '/') {
      console.log('Client role detected, redirecting to client dashboard')
      navigate('/client-dashboard')
      return
    }
    
    console.log('No redirect needed, staying on current route')
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🐾</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando PetHub...</h2>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
