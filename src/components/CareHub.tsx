import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Utensils, 
  Activity, 
  Stethoscope, 
  Heart
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  image_url?: string;
}

const CareHub: React.FC = () => {
  const { user } = useAuth();
  const { data: pets, isLoading } = usePets(user?.id);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (pets && pets.length > 0) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  const handleCareAction = (type: string) => {
    switch (type) {
      case 'feeding':
        window.location.href = '/feeding-schedules';
        break;
      case 'exercise':
        window.location.href = '/trazabilidad';
        break;
      case 'vet':
        window.location.href = '/veterinaria';
        break;
    }
  };

  const getPetEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="p-6 text-center pb-20">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas registradas!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para comenzar a cuidarla
        </p>
        <Button 
          onClick={() => window.location.href = '/pet-creation'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Crear Mi Primera Mascota
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-20">
      {/* Pet Info Header */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {selectedPet.image_url ? (
              <img
                src={selectedPet.image_url}
                alt={selectedPet.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                {getPetEmoji(selectedPet.species)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h2>
              <p className="text-gray-600">{selectedPet.breed || selectedPet.species}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Care Options */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Heart className="w-6 h-6 text-pink-600" />
            ¿Qué quieres hacer hoy?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => handleCareAction('feeding')}
              className="w-full h-16 flex items-center justify-start space-x-4 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 text-white text-left"
            >
              <Utensils className="w-8 h-8" />
              <div>
                <div className="text-lg font-semibold">Nutrición</div>
                <div className="text-sm opacity-90">Programar comidas y horarios</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleCareAction('exercise')}
              className="w-full h-16 flex items-center justify-start space-x-4 bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 text-white text-left"
            >
              <Activity className="w-8 h-8" />
              <div>
                <div className="text-lg font-semibold">Ejercicio</div>
                <div className="text-sm opacity-90">Registrar actividades y paseos</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleCareAction('vet')}
              className="w-full h-16 flex items-center justify-start space-x-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 text-white text-left"
            >
              <Stethoscope className="w-8 h-8" />
              <div>
                <div className="text-lg font-semibold">Veterinaria</div>
                <div className="text-sm opacity-90">Citas médicas y salud</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareHub;