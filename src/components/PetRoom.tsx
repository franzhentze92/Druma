import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets, useUserProfile } from '@/hooks/useSettings';
import QuickActions from './QuickActions';
import FeedingNotification from './FeedingNotification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Icons removed from this page to avoid unused imports; QuickActions handles its own icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  image_url?: string;
}

const PetRoom: React.FC = () => {
  const { user } = useAuth();
  const { data: pets, isLoading } = usePets(user?.id);
  const { data: userProfile } = useUserProfile(user?.id);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  // Remove gamified/mocked state for a real-data-only Inicio

  useEffect(() => {
    if (pets && pets.length > 0) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  // No gamified dynamic mood/points on Inicio

  const handlePetClick = () => {
    // Pet interaction - could trigger animations, sounds, or mini-games
    console.log(`${selectedPet?.name} was clicked!`);
  };

  const handleFeed = () => {
    console.log('Feed action triggered');
    // Navigate to real nutrition page from bottom menu
    window.location.href = '/feeding-schedules';
  };

  const handleWalk = () => {
    console.log('Walk action triggered');
    // Navigate to real exercise page from bottom menu
    window.location.href = '/trazabilidad';
  };

  const handleVet = () => {
    console.log('Vet action triggered');
    // Navigate to real veterinary page from bottom menu
    window.location.href = '/veterinaria';
  };

  const handlePlay = () => {
    console.log('Play action triggered');
    // Navigate to real social page from bottom menu
    window.location.href = '/parejas';
  };

  const handleReminders = () => {
    console.log('Reminders action triggered');
    // Navigate to real reminders page from bottom menu
    window.location.href = '/ajustes';
  };

  const handleShopping = () => {
    console.log('Shopping action triggered');
    // Navigate to real marketplace from bottom menu
    window.location.href = '/marketplace';
  };

  const handleSchedule = () => {
    console.log('Schedule action triggered');
    // Navigate to real nutrition page from bottom menu
    window.location.href = '/feeding-schedules';
  };

  const handlePhotos = () => {
    console.log('Photos action triggered');
    // Navigate to real adoption page from bottom menu
    window.location.href = '/adopcion';
  };

  const handleLostPets = () => {
    console.log('Lost pets action triggered');
    // Navigate to real lost pets page from bottom menu
    window.location.href = '/mascotas-perdidas';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu mascota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡No tienes mascotas aún!
          </h2>
          <p className="text-gray-600 mb-6">
            Puedes crear una mascota desde la sección de Ajustes cuando estés listo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/ajustes'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Ir a Ajustes
            </Button>
            <Button 
              onClick={() => window.location.href = '/pet-creation'}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Crear Mascota
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Upcoming meals (real) */}
      <FeedingNotification />

      {/* Welcome Message */
      }
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  ¡Hola, {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuario'}!
                </h1>
                <p className="text-white/90 text-lg">
                  {selectedPet ? 
                    `Espero que ${selectedPet.name} esté teniendo un gran día` : 
                    'Espero que tengas un gran día'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80 mb-1">Hoy es</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Selector */}
      {pets && pets.length > 1 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {selectedPet?.name?.charAt(0) || '🐾'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Seleccionar Mascota</h3>
                  <p className="text-sm text-gray-600">Cambia entre tus mascotas</p>
                </div>
              </div>
              <Select 
                value={selectedPet?.id || ''} 
                onValueChange={(petId) => {
                  const pet = pets.find(p => p.id === petId);
                  if (pet) setSelectedPet(pet);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleccionar mascota" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {pet.name.charAt(0)}
                          </span>
                        </div>
                        <span>{pet.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {pet.species}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed gamified stats (PetPoints, Nivel, Felicidad) */}

      {/* Pet summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {selectedPet?.name?.charAt(0) || '🐾'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPet?.name}</h2>
                <p className="text-sm text-gray-600">{selectedPet?.species} • {selectedPet?.breed}</p>
              </div>
            </div>
            {pets && pets.length > 1 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {pets.findIndex(p => p.id === selectedPet?.id) + 1} de {pets.length}
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <Button variant="outline" onClick={handlePetClick}>Interactuar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-gray-900">
            ¿Qué quieres hacer hoy?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActions
            onFeed={handleFeed}
            onWalk={handleWalk}
            onVet={handleVet}
            onPlay={handlePlay}
            onReminders={handleReminders}
            onShopping={handleShopping}
            onSchedule={handleSchedule}
            onPhotos={handlePhotos}
            onLostPets={handleLostPets}
          />
        </CardContent>
      </Card>

      {/* Removed mocked Recent Activity and Achievements */}
    </div>
  );
};

export default PetRoom;
