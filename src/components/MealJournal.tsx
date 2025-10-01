import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  Utensils, 
  Clock, 
  Heart, 
  Star, 
  Calendar, 
  Plus, 
  CheckCircle,
  Smile,
  Frown,
  Coffee,
  Zap,
  Gift,
  Trophy,
  Flame
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface MealRecord {
  id: string;
  pet_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  quantity: number;
  fed_at: string;
  notes?: string;
  pet_happiness: number;
  xp_earned: number;
}

const MealJournal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [petHappiness, setPetHappiness] = useState(85);
  const [petLevel, setPetLevel] = useState(1);
  const [feedingStreak, setFeedingStreak] = useState(3);
  const [todayMeals, setTodayMeals] = useState(0);
  
  // Quick feed form
  const [quickFeedForm, setQuickFeedForm] = useState({
    meal_type: 'snack',
    food_name: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPet) {
      loadMeals();
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

  const loadMeals = async () => {
    if (!selectedPet) return;
    
    try {
      setLoading(true);
      // Mock data for demonstration - in real app, this would come from database
      const mockMeals: MealRecord[] = [
        {
          id: '1',
          pet_id: selectedPet.id,
          meal_type: 'breakfast',
          food_name: 'Croquetas Premium',
          quantity: 150,
          fed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          notes: 'Se comió todo muy rápido',
          pet_happiness: 90,
          xp_earned: 5
        },
        {
          id: '2',
          pet_id: selectedPet.id,
          meal_type: 'dinner',
          food_name: 'Croquetas Premium',
          quantity: 180,
          fed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          notes: 'Muy hambriento',
          pet_happiness: 85,
          xp_earned: 5
        }
      ];
      setMeals(mockMeals);
      
      // Count today's meals
      const today = new Date().toDateString();
      const todayMealCount = mockMeals.filter(meal => 
        new Date(meal.fed_at).toDateString() === today
      ).length;
      setTodayMeals(todayMealCount);
      
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePetStats = () => {
    // Mock calculations - in real app, this would be based on actual data
    setPetHappiness(Math.min(100, 85 + (todayMeals * 5)));
    setPetLevel(Math.floor(petHappiness / 20) + 1);
  };

  const handleQuickFeed = async () => {
    if (!selectedPet || !quickFeedForm.food_name || !quickFeedForm.quantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock meal creation - in real app, save to database
      const newMeal: MealRecord = {
        id: Date.now().toString(),
        pet_id: selectedPet.id,
        meal_type: quickFeedForm.meal_type as any,
        food_name: quickFeedForm.food_name,
        quantity: parseInt(quickFeedForm.quantity),
        fed_at: new Date().toISOString(),
        notes: quickFeedForm.notes,
        pet_happiness: petHappiness + 5,
        xp_earned: 5
      };

      setMeals(prev => [newMeal, ...prev]);
      setPetHappiness(prev => Math.min(100, prev + 5));
      setTodayMeals(prev => prev + 1);
      setFeedingStreak(prev => prev + 1);

      toast({
        title: "¡Comida servida! 🍖",
        description: `${selectedPet.name} está muy feliz. +5 XP ganado!`,
      });

      // Reset form
      setQuickFeedForm({
        meal_type: 'snack',
        food_name: '',
        quantity: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error feeding pet:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la comida",
        variant: "destructive"
      });
    }
  };

  const getPetMood = () => {
    if (petHappiness >= 90) return { mood: 'happy', message: '¡Estoy súper feliz!', icon: '😊', color: 'text-green-500' };
    if (petHappiness >= 70) return { mood: 'content', message: 'Me siento bien', icon: '😌', color: 'text-blue-500' };
    if (petHappiness >= 50) return { mood: 'neutral', message: 'Estoy bien', icon: '😐', color: 'text-yellow-500' };
    if (petHappiness >= 30) return { mood: 'hungry', message: 'Tengo hambre', icon: '😕', color: 'text-orange-500' };
    return { mood: 'sad', message: 'Estoy muy hambriento', icon: '😢', color: 'text-red-500' };
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍪';
      default: return '🍽️';
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
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para comenzar a alimentarla
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
      {/* Pet Status Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
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
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-gray-900">{petHappiness}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-gray-900">{feedingStreak} días</span>
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${petHappiness}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Feed Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Utensils className="w-6 h-6 text-orange-600" />
            🍖 Alimentar a {selectedPet.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="meal-type">Tipo de comida</Label>
              <Select value={quickFeedForm.meal_type} onValueChange={(value) => setQuickFeedForm(prev => ({ ...prev, meal_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Desayuno</SelectItem>
                  <SelectItem value="lunch">🌞 Almuerzo</SelectItem>
                  <SelectItem value="dinner">🌙 Cena</SelectItem>
                  <SelectItem value="snack">🍪 Merienda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="food-name">¿Qué comió?</Label>
              <Input
                id="food-name"
                value={quickFeedForm.food_name}
                onChange={(e) => setQuickFeedForm(prev => ({ ...prev, food_name: e.target.value }))}
                placeholder="Croquetas, pollo, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Cantidad (gramos)</Label>
              <Input
                id="quantity"
                type="number"
                value={quickFeedForm.quantity}
                onChange={(e) => setQuickFeedForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="150"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleQuickFeed}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Utensils className="w-4 h-4 mr-2" />
                ¡Alimentar!
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              value={quickFeedForm.notes}
              onChange={(e) => setQuickFeedForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="¿Cómo se comportó? ¿Le gustó la comida?"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{todayMeals}</div>
            <div className="text-sm opacity-90">Comidas hoy</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{feedingStreak}</div>
            <div className="text-sm opacity-90">Días seguidos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petLevel}</div>
            <div className="text-sm opacity-90">Nivel</div>
          </CardContent>
        </Card>
      </div>

      {/* Meal History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-6 h-6 text-blue-600" />
            📖 Diario de Comidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🍽️</div>
              <p className="text-gray-600">Aún no hay comidas registradas</p>
              <p className="text-sm text-gray-500 mt-2">¡Alimenta a tu mascota para comenzar el diario!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getMealIcon(meal.meal_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{meal.food_name}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {meal.quantity}g
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(meal.fed_at).toLocaleString()}
                      </div>
                      {meal.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          💬 {meal.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">+{meal.xp_earned} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">{meal.pet_happiness}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para cuidar mejor a {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Alimenta a {selectedPet.name} a horas regulares para mantener su felicidad</li>
                <li>• Cada comida aumenta su felicidad y te da puntos de experiencia</li>
                <li>• ¡Mantén la racha de alimentación para ganar logros especiales!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealJournal;
