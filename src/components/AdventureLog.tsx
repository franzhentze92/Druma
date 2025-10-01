import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Activity, 
  Clock, 
  Heart, 
  Star, 
  Calendar, 
  Plus, 
  CheckCircle,
  Smile,
  Frown,
  Zap,
  Trophy,
  Flame,
  MapPin,
  Timer,
  Target
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface Adventure {
  id: string;
  pet_id: string;
  activity_type: 'walk' | 'play' | 'run' | 'hike' | 'swim';
  duration_minutes: number;
  distance_km?: number;
  calories_burned: number;
  adventure_date: string;
  notes?: string;
  energy_level: number;
  xp_earned: number;
  weather?: string;
  location?: string;
}

const AdventureLog: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(false);
  const [petEnergy, setPetEnergy] = useState(75);
  const [petLevel, setPetLevel] = useState(1);
  const [exerciseStreak, setExerciseStreak] = useState(2);
  const [weeklyGoal, setWeeklyGoal] = useState(300); // minutes
  const [weeklyProgress, setWeeklyProgress] = useState(180);
  
  // Quick adventure form
  const [quickAdventureForm, setQuickAdventureForm] = useState({
    activity_type: 'walk',
    duration_minutes: '',
    distance_km: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPet) {
      loadAdventures();
      calculatePetStats();
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      setPets(data || []);
      if (data && data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadAdventures = async () => {
    if (!selectedPet) return;
    
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockAdventures: Adventure[] = [
        {
          id: '1',
          pet_id: selectedPet.id,
          activity_type: 'walk',
          duration_minutes: 30,
          distance_km: 2.5,
          calories_burned: 120,
          adventure_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          notes: '¡Paseo muy divertido por el parque!',
          energy_level: 85,
          xp_earned: 10,
          weather: 'Soleado',
          location: 'Parque Central'
        },
        {
          id: '2',
          pet_id: selectedPet.id,
          activity_type: 'play',
          duration_minutes: 45,
          calories_burned: 200,
          adventure_date: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // Yesterday
          notes: 'Jugamos con la pelota en el jardín',
          energy_level: 90,
          xp_earned: 15,
          weather: 'Parcialmente nublado',
          location: 'Casa'
        }
      ];
      setAdventures(mockAdventures);
      
    } catch (error) {
      console.error('Error loading adventures:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePetStats = () => {
    // Calculate weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weeklyAdventures = adventures.filter(adv => 
      new Date(adv.adventure_date) >= weekStart
    );
    
    const weeklyMinutes = weeklyAdventures.reduce((total, adv) => total + adv.duration_minutes, 0);
    setWeeklyProgress(weeklyMinutes);
    
    // Calculate energy and level based on recent activity
    const recentActivity = adventures.filter(adv => 
      new Date(adv.adventure_date) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    setPetEnergy(Math.min(100, 75 + (recentActivity.length * 5)));
    setPetLevel(Math.floor(weeklyMinutes / 150) + 1);
  };

  const handleQuickAdventure = async () => {
    if (!selectedPet || !quickAdventureForm.duration_minutes) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const duration = parseInt(quickAdventureForm.duration_minutes);
      const distance = quickAdventureForm.distance_km ? parseFloat(quickAdventureForm.distance_km) : undefined;
      
      // Calculate calories based on activity type and duration
      const caloriesPerMinute = {
        walk: 4,
        play: 6,
        run: 8,
        hike: 10,
        swim: 12
      };
      
      const calories = duration * caloriesPerMinute[quickAdventureForm.activity_type as keyof typeof caloriesPerMinute];
      const xp = Math.floor(calories / 10) + (distance ? Math.floor(distance * 2) : 0);

      const newAdventure: Adventure = {
        id: Date.now().toString(),
        pet_id: selectedPet.id,
        activity_type: quickAdventureForm.activity_type as any,
        duration_minutes: duration,
        distance_km: distance,
        calories_burned: calories,
        adventure_date: new Date().toISOString(),
        notes: quickAdventureForm.notes,
        energy_level: petEnergy + 10,
        xp_earned: xp,
        location: quickAdventureForm.location || 'Casa'
      };

      setAdventures(prev => [newAdventure, ...prev]);
      setPetEnergy(prev => Math.min(100, prev + 10));
      setWeeklyProgress(prev => prev + duration);
      setExerciseStreak(prev => prev + 1);

      toast({
        title: "¡Aventura completada! 🏃",
        description: `${selectedPet.name} se divirtió mucho. +${xp} XP ganado!`,
      });

      // Reset form
      setQuickAdventureForm({
        activity_type: 'walk',
        duration_minutes: '',
        distance_km: '',
        location: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error recording adventure:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la aventura",
        variant: "destructive"
      });
    }
  };

  const getPetMood = () => {
    if (petEnergy >= 90) return { mood: 'energetic', message: '¡Estoy súper energético!', icon: '⚡', color: 'text-yellow-500' };
    if (petEnergy >= 70) return { mood: 'active', message: 'Me siento muy activo', icon: '🏃', color: 'text-green-500' };
    if (petEnergy >= 50) return { mood: 'normal', message: 'Estoy listo para jugar', icon: '😊', color: 'text-blue-500' };
    if (petEnergy >= 30) return { mood: 'tired', message: 'Estoy un poco cansado', icon: '😴', color: 'text-orange-500' };
    return { mood: 'exhausted', message: 'Necesito descansar', icon: '😵', color: 'text-red-500' };
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'walk': return '🚶';
      case 'play': return '🎾';
      case 'run': return '🏃';
      case 'hike': return '🥾';
      case 'swim': return '🏊';
      default: return '🏃';
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

  const petMood = getPetMood();

  if (!selectedPet) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🏃</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para comenzar las aventuras
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
    <div className="p-6 space-y-6">
      {/* Pet Energy Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {selectedPet.image_url ? (
                  <img
                    src={selectedPet.image_url}
                    alt={selectedPet.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                    {getPetEmoji(selectedPet.species)}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-800">{petLevel}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${petMood.color}`}>{petMood.icon}</span>
                  <span className="text-gray-600">{petMood.message}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">{petEnergy}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-gray-900">{exerciseStreak} días</span>
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${petEnergy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="w-6 h-6 text-blue-600" />
            🎯 Meta Semanal de Ejercicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progreso esta semana</span>
              <span className="text-sm font-medium text-gray-900">{weeklyProgress} / {weeklyGoal} minutos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (weeklyProgress / weeklyGoal) * 100)}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {weeklyGoal - weeklyProgress > 0 
                  ? `Faltan ${weeklyGoal - weeklyProgress} minutos para completar la meta`
                  : '¡Meta semanal completada! 🎉'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Adventure Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="w-6 h-6 text-green-600" />
            🏃 Registrar Nueva Aventura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="activity-type">Tipo de actividad</Label>
              <Select value={quickAdventureForm.activity_type} onValueChange={(value) => setQuickAdventureForm(prev => ({ ...prev, activity_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">🚶 Caminata</SelectItem>
                  <SelectItem value="play">🎾 Juego</SelectItem>
                  <SelectItem value="run">🏃 Carrera</SelectItem>
                  <SelectItem value="hike">🥾 Senderismo</SelectItem>
                  <SelectItem value="swim">🏊 Natación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duración (min)</Label>
              <Input
                id="duration"
                type="number"
                value={quickAdventureForm.duration_minutes}
                onChange={(e) => setQuickAdventureForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                placeholder="30"
              />
            </div>
            
            <div>
              <Label htmlFor="distance">Distancia (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={quickAdventureForm.distance_km}
                onChange={(e) => setQuickAdventureForm(prev => ({ ...prev, distance_km: e.target.value }))}
                placeholder="2.5"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={quickAdventureForm.location}
                onChange={(e) => setQuickAdventureForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Parque, casa, etc."
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleQuickAdventure}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Activity className="w-4 h-4 mr-2" />
                ¡Aventurar!
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="notes">Notas de la aventura</Label>
            <Input
              id="notes"
              value={quickAdventureForm.notes}
              onChange={(e) => setQuickAdventureForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="¿Cómo fue la aventura? ¿Qué hizo tu mascota?"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{adventures.length}</div>
            <div className="text-sm opacity-90">Aventuras</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Timer className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{weeklyProgress}</div>
            <div className="text-sm opacity-90">Min esta semana</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{exerciseStreak}</div>
            <div className="text-sm opacity-90">Días seguidos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petLevel}</div>
            <div className="text-sm opacity-90">Nivel</div>
          </CardContent>
        </Card>
      </div>

      {/* Adventure History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-6 h-6 text-green-600" />
            📖 Diario de Aventuras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando aventuras...</p>
            </div>
          ) : adventures.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏃</div>
              <p className="text-gray-600">Aún no hay aventuras registradas</p>
              <p className="text-sm text-gray-500 mt-2">¡Sal a caminar con tu mascota para comenzar el diario!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adventures.map((adventure) => (
                <div key={adventure.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getActivityIcon(adventure.activity_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 capitalize">{adventure.activity_type}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {adventure.duration_minutes} min
                        </Badge>
                        {adventure.distance_km && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {adventure.distance_km} km
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(adventure.adventure_date).toLocaleString()}
                        {adventure.location && ` • ${adventure.location}`}
                      </div>
                      {adventure.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          💬 {adventure.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">+{adventure.xp_earned} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{adventure.calories_burned} cal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para aventuras con {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ejercita a {selectedPet.name} regularmente para mantener su energía alta</li>
                <li>• Cada aventura aumenta su energía y te da puntos de experiencia</li>
                <li>• ¡Mantén la racha de ejercicio para ganar logros especiales!</li>
                <li>• Las actividades más intensas dan más XP y calorías quemadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdventureLog;
