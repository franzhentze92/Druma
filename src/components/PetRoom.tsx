import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePets, useUserProfile } from '@/hooks/useSettings';
import PetHero from './PetHero';
import QuickActions from './QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Award, Clock, Heart, Star, Zap, 
  Activity, Calendar, Camera, MapPin, ShoppingBag,
  Bell, Stethoscope, Utensils, ChevronDown
} from 'lucide-react';
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
  const [petMood, setPetMood] = useState<'happy' | 'hungry' | 'tired' | 'excited' | 'sad'>('happy');
  const [petLevel, setPetLevel] = useState(1);
  const [petHappiness, setPetHappiness] = useState(85);
  const [petPoints, setPetPoints] = useState(10);

  // Mock data for demonstration - in real app, this would come from database
  const [recentActivity] = useState([
    { id: 1, type: 'walk', description: 'Caminata matutina', time: 'Hace 2 horas', points: 5 },
    { id: 2, type: 'feed', description: 'Desayuno saludable', time: 'Hace 4 horas', points: 3 },
    { id: 3, type: 'vet', description: 'Checkup médico', time: 'Ayer', points: 10 },
    { id: 4, type: 'play', description: 'Tiempo de juego', time: 'Ayer', points: 2 }
  ]);

  const [achievements] = useState([
    { id: 1, title: 'Primer Amigo', description: 'Creaste tu primera mascota', icon: '🏆', unlocked: true },
    { id: 2, title: 'Caminante', description: 'Primera caminata registrada', icon: '🚶', unlocked: true },
    { id: 3, title: 'Chef', description: 'Alimentación perfecta por 3 días', icon: '👨‍🍳', unlocked: false },
    { id: 4, title: 'Doctor', description: 'Primera visita al veterinario', icon: '🩺', unlocked: false }
  ]);

  useEffect(() => {
    if (pets && pets.length > 0) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  // Simulate pet mood changes based on time and activities
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 7 && hour < 9) {
      setPetMood('hungry'); // Breakfast time
    } else if (hour >= 12 && hour < 14) {
      setPetMood('hungry'); // Lunch time
    } else if (hour >= 18 && hour < 20) {
      setPetMood('hungry'); // Dinner time
    } else if (hour >= 22 || hour < 6) {
      setPetMood('tired'); // Sleep time
    } else {
      setPetMood('happy'); // Play time
    }
  }, []);

  // Determine which actions should glow based on pet mood
  const getGlowingActions = () => {
    const glowing = [];
    if (petMood === 'hungry') glowing.push('feed');
    if (petMood === 'tired') glowing.push('play');
    if (petHappiness < 70) glowing.push('walk');
    return glowing;
  };

  const glowingActions = getGlowingActions();

  const handlePetClick = () => {
    // Pet interaction - could trigger animations, sounds, or mini-games
    console.log(`${selectedPet?.name} was clicked!`);
    
    // Random chance to gain happiness or points
    if (Math.random() > 0.7) {
      setPetHappiness(prev => Math.min(100, prev + 1));
      setPetPoints(prev => prev + 1);
    }
  };

  const handleFeed = () => {
    console.log('Feed action triggered');
    // Navigate to gamified feeding module
    window.location.href = '/meal-journal';
  };

  const handleWalk = () => {
    console.log('Walk action triggered');
    // Navigate to gamified exercise module
    window.location.href = '/adventure-log';
  };

  const handleVet = () => {
    console.log('Vet action triggered');
    // Navigate to gamified health module
    window.location.href = '/health-journal';
  };

  const handlePlay = () => {
    console.log('Play action triggered');
    setPetMood('excited');
    setPetHappiness(prev => Math.min(100, prev + 6));
    setPetPoints(prev => prev + 2);
    // Could navigate to a play/mini-game module in the future
  };

  const handleReminders = () => {
    console.log('Reminders action triggered');
    // Navigate to gamified reminders module
    window.location.href = '/pet-reminders';
  };

  const handleShopping = () => {
    console.log('Shopping action triggered');
    // Navigate to marketplace
  };

  const handleSchedule = () => {
    console.log('Schedule action triggered');
    // Navigate to feeding schedules
  };

  const handlePhotos = () => {
    console.log('Photos action triggered');
    // Navigate to photo gallery
  };

  const handleLostPets = () => {
    console.log('Lost pets action triggered');
    // Navigate to lost pets section
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
      {/* Welcome Message */}
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

      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petPoints}</div>
            <div className="text-xs opacity-90">PetPoints</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petLevel}</div>
            <div className="text-xs opacity-90">Nivel</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petHappiness}%</div>
            <div className="text-xs opacity-90">Felicidad</div>
          </CardContent>
        </Card>
      </div>

      {/* Pet Hero */}
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
          <PetHero 
            pet={selectedPet}
            mood={petMood}
            level={petLevel}
            happiness={petHappiness}
            onPetClick={handlePetClick}
          />
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

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="w-5 h-5 text-green-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {activity.type === 'walk' && <Activity className="w-4 h-4 text-white" />}
                    {activity.type === 'feed' && <Utensils className="w-4 h-4 text-white" />}
                    {activity.type === 'vet' && <Stethoscope className="w-4 h-4 text-white" />}
                    {activity.type === 'play' && <Heart className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  +{activity.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Award className="w-5 h-5 text-yellow-600" />
            Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`
                  p-3 rounded-lg border-2 transition-all duration-300
                  ${achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    text-2xl transition-all duration-300
                    ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}
                  `}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetRoom;
