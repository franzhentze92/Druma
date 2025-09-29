import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Activity,
  Plus,
  Clock,
  Calendar,
  Target,
  Zap,
  Timer,
  BarChart3,
  TrendingUp,
  Filter,
  Footprints,
  Play,
  Waves,
  Trophy,
  Dumbbell,
  MoreHorizontal
} from 'lucide-react';
import PageHeader from './PageHeader';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  weight: number;
}

interface ExerciseSession {
  id: string;
  pet_id: string;
  pet_name: string;
  exercise_type: string;
  duration_minutes: number;
  intensity: string;
  date: string;
  notes: string;
  calories_burned: number;
  created_at: string;
}

const Trazabilidad: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // States
  const [pets, setPets] = useState<Pet[]>([]);
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPetForAnalytics, setSelectedPetForAnalytics] = useState('all');

  // Form states
  const [selectedPet, setSelectedPet] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('');
  const [exerciseDate, setExerciseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState(0);

  // Load data
  useEffect(() => {
    if (user) {
      loadPets();
      loadExerciseSessions();
    }
  }, [user]);

  // Calculate calories when form changes
  useEffect(() => {
    if (selectedPet && duration && intensity && exerciseType) {
      const selectedPetData = pets.find(p => p.id === selectedPet);
      const durationNum = parseFloat(duration);
      
      if (selectedPetData && durationNum > 0) {
        // Base calories per minute for different exercise types
        const exerciseCalorieRates: Record<string, number> = {
          'walk': 2,           // Caminata - Low intensity
          'run': 8,            // Carrera - High intensity
          'play': 4,           // Juego - Medium intensity
          'swimming': 6,       // Natación - High intensity
          'agility': 7,        // Agilidad - High intensity
          'training': 5,       // Entrenamiento - Medium-High intensity
          'fetch': 3,          // Buscar Pelota - Medium intensity
          'hiking': 5,         // Senderismo - Medium-High intensity
          'tug': 4,            // Tirar de la Cuerda - Medium intensity
          'hide': 3,           // Buscar y Encontrar - Medium intensity
          'obstacle': 6,       // Carrera de Obstáculos - High intensity
          'other': 3           // Otro - Default medium
        };

        // Get base calories per minute for this exercise
        const baseCaloriesPerMinute = exerciseCalorieRates[exerciseType] || 3;
        
        // Intensity multipliers
        const intensityMultiplier = intensity === 'low' ? 0.7 : intensity === 'medium' ? 1.0 : 1.3;
        
        // Pet weight factor (heavier pets burn more calories)
        const weightFactor = selectedPetData.weight ? Math.sqrt(selectedPetData.weight / 20) : 1;
        
        // Calculate total calories
        const calories = Math.round(baseCaloriesPerMinute * durationNum * intensityMultiplier * weightFactor);
        
        setCalculatedCalories(calories);
      }
    } else {
      setCalculatedCalories(0);
    }
  }, [selectedPet, duration, intensity, exerciseType, pets]);

  const loadPets = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
        .eq('owner_id', user?.id);
        
        if (error) throw error;
        setPets(data || []);
      } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadExerciseSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('exercise_sessions')
          .select(`
            *,
            pets(name)
          `)
          .eq('owner_id', user?.id)
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error loading exercise sessions:', error);
          setExerciseSessions([]);
          return;
        }

        const formattedSessions = data?.map(session => ({
          ...session,
          pet_name: session.pets?.name || 'Unknown Pet'
        })) || [];
        
        setExerciseSessions(formattedSessions);
      } catch (error) {
        console.error('Error loading exercise sessions:', error);
        setExerciseSessions([]);
      }
    };

  const resetForm = () => {
    setSelectedPet('');
    setExerciseType('');
    setDuration('');
    setIntensity('');
    setExerciseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setCalculatedCalories(0);
  };

  const saveExerciseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPet || !exerciseType || !duration || !intensity) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const durationNum = parseFloat(duration);
      
      // Use the calculated calories from the form
      const caloriesBurned = calculatedCalories;

      const exerciseData = {
        pet_id: selectedPet,
        exercise_type: exerciseType,
        duration_minutes: durationNum,
        intensity: intensity,
        date: exerciseDate,
        notes: notes || null,
        calories_burned: caloriesBurned,
        owner_id: user?.id
      };

      const { error } = await supabase
        .from('exercise_sessions')
        .insert([exerciseData]);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Sesión de ejercicio registrada correctamente.",
      });

      resetForm();
      loadExerciseSessions();
    } catch (error) {
      console.error('Error saving exercise session:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la sesión de ejercicio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exerciseTypes = [
    { value: 'walk', label: 'Caminata', icon: Footprints },
    { value: 'run', label: 'Carrera', icon: Activity },
    { value: 'play', label: 'Juego', icon: Play },
    { value: 'swimming', label: 'Natación', icon: Waves },
    { value: 'agility', label: 'Agilidad', icon: Trophy },
    { value: 'training', label: 'Entrenamiento', icon: Dumbbell },
    { value: 'fetch', label: 'Buscar Pelota', icon: Target },
    { value: 'hiking', label: 'Senderismo', icon: Footprints },
    { value: 'tug', label: 'Tirar de la Cuerda', icon: Activity },
    { value: 'hide', label: 'Buscar y Encontrar', icon: Target },
    { value: 'obstacle', label: 'Carrera de Obstáculos', icon: Trophy },
    { value: 'other', label: 'Otro', icon: MoreHorizontal }
  ];

  const intensityLevels = [
    { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' }
  ];

  // Analytics functions
  const getFilteredExerciseSessions = () => {
    if (selectedPetForAnalytics === 'all') {
      return exerciseSessions;
    }
    return exerciseSessions.filter(session => session.pet_id === selectedPetForAnalytics);
  };

  const getExerciseStats = () => {
    const filteredSessions = getFilteredExerciseSessions();
    
    if (filteredSessions.length === 0) {
      return {
        total_sessions: 0,
        total_duration: 0,
        total_calories: 0,
        average_duration: 0,
        favorite_exercise: 'N/A',
        most_active_pet: 'N/A'
      };
    }

    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
    const totalCalories = filteredSessions.reduce((sum, session) => sum + session.calories_burned, 0);
    const averageDuration = Math.round(totalDuration / totalSessions);

    // Find favorite exercise type
    const exerciseCounts = filteredSessions.reduce((acc, session) => {
      acc[session.exercise_type] = (acc[session.exercise_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteExercise = Object.keys(exerciseCounts).reduce((a, b) => 
      exerciseCounts[a] > exerciseCounts[b] ? a : b
    );

    // Find most active pet
    const petCounts = filteredSessions.reduce((acc, session) => {
      acc[session.pet_name] = (acc[session.pet_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActivePet = Object.keys(petCounts).reduce((a, b) => 
      petCounts[a] > petCounts[b] ? a : b
    );

    return {
      total_sessions: totalSessions,
      total_duration: totalDuration,
      total_calories: totalCalories,
      average_duration: averageDuration,
      favorite_exercise: getExerciseTypeLabel(favoriteExercise),
      most_active_pet: mostActivePet
    };
  };

  const getExerciseTypeLabel = (exerciseType: string) => {
    const typeData = exerciseTypes.find(t => t.value === exerciseType);
    if (typeData) {
      return typeData.label;
    }
    
    // Fallback for any other English exercise types
    const englishToSpanish: Record<string, string> = {
      'walking': 'Caminata',
      'running': 'Carrera',
      'playing': 'Juego',
      'jogging': 'Carrera',
      'swimming': 'Natación',
      'agility': 'Agilidad',
      'training': 'Entrenamiento',
      'exercise': 'Ejercicio',
      'workout': 'Entrenamiento',
      'fetch': 'Buscar Pelota',
      'hiking': 'Senderismo',
      'tug': 'Tirar de la Cuerda',
      'hide': 'Buscar y Encontrar',
      'obstacle': 'Carrera de Obstáculos'
    };
    
    return englishToSpanish[exerciseType] || exerciseType;
  };

  const getExerciseTypeIcon = (exerciseType: string) => {
    const typeData = exerciseTypes.find(t => t.value === exerciseType);
    if (typeData) {
      return typeData.icon;
    }
    
    // Fallback icons for English exercise types
    const englishIcons: Record<string, any> = {
      'walking': Footprints,
      'running': Activity,
      'playing': Play,
      'jogging': Activity,
      'swimming': Waves,
      'agility': Trophy,
      'training': Dumbbell,
      'exercise': Activity,
      'workout': Dumbbell,
      'fetch': Target,
      'hiking': Footprints,
      'tug': Activity,
      'hide': Target,
      'obstacle': Trophy
    };
    
    return englishIcons[exerciseType] || Activity;
  };

  const exerciseStats = getExerciseStats();

  // Prepare chart data for time series
  const getChartData = () => {
    const filteredSessions = getFilteredExerciseSessions();
    
    // Group sessions by date
    const sessionsByDate = filteredSessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = {
          date: new Date(date).toLocaleDateString('es-GT'),
          sessions: 0,
          duration: 0,
          calories: 0
        };
      }
      acc[date].sessions += 1;
      acc[date].duration += session.duration_minutes;
      acc[date].calories += session.calories_burned;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    return Object.values(sessionsByDate).sort((a: any, b: any) => 
      new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime()
    );
  };

  const chartData = getChartData();

    return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Ejercicio"
        subtitle="Registra y gestiona las actividades físicas de tus mascotas"
        gradient="from-orange-500 to-red-500"
      >
        <Activity className="w-8 h-8" />
      </PageHeader>

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Registrar Ejercicio
              </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Historial
              </TabsTrigger>
            </TabsList>

        <TabsContent value="register" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-600" />
            Registrar Nueva Sesión de Ejercicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
          <form onSubmit={saveExerciseSession} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pet Selection */}
                      <div>
                        <Label htmlFor="pet">Mascota *</Label>
                        <Select value={selectedPet} onValueChange={setSelectedPet}>
                          <SelectTrigger>
                    <SelectValue placeholder="Selecciona una mascota" />
                          </SelectTrigger>
                          <SelectContent>
                            {pets.map((pet) => (
                              <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

              {/* Exercise Type */}
                      <div>
                <Label htmlFor="exercise-type">Tipo de Ejercicio *</Label>
                        <Select value={exerciseType} onValueChange={setExerciseType}>
                          <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                    {exerciseTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                              <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {type.label}
                          </div>
                              </SelectItem>
                      );
                    })}
                          </SelectContent>
                        </Select>
                      </div>

              {/* Duration */}
                      <div>
                        <Label htmlFor="duration">Duración (minutos) *</Label>
                        <Input
                          type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ej: 30"
                          min="1"
                  step="1"
                        />
                    </div>

              {/* Intensity */}
                      <div>
                <Label htmlFor="intensity">Intensidad *</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                          <SelectTrigger>
                    <SelectValue placeholder="Selecciona la intensidad" />
                          </SelectTrigger>
                          <SelectContent>
                    {intensityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

              {/* Calories Display */}
              <div className="md:col-span-2">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">
                      Calorías estimadas: {calculatedCalories > 0 ? calculatedCalories : '--'} cal
                    </span>
                      </div>
                  <p className="text-sm text-orange-700 mt-1">
                    {calculatedCalories > 0 
                      ? `Basado en ${exerciseTypes.find(t => t.value === exerciseType)?.label || exerciseType}, intensidad ${intensityLevels.find(i => i.value === intensity)?.label || intensity} y peso de la mascota`
                      : "Selecciona mascota, ejercicio, duración e intensidad para calcular"
                    }
                  </p>
                            </div>
                          </div>
                          
              {/* Date */}
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  type="date"
                  value={exerciseDate}
                  onChange={(e) => setExerciseDate(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
                      <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones sobre la sesión de ejercicio..."
                          rows={3}
                        />
                    </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Activity className="w-4 h-4 mr-2" />
              {loading ? 'Registrando...' : 'Registrar Sesión de Ejercicio'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Pet Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                Filtrar por Mascota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPetForAnalytics} onValueChange={setSelectedPetForAnalytics}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una mascota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las mascotas</SelectItem>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Exercise Statistics Cards */}
          {exerciseStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Sesiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{exerciseStats.total_sessions}</div>
                  <p className="text-xs text-gray-500">Sesiones registradas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tiempo Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{exerciseStats.total_duration}</div>
                  <p className="text-xs text-gray-500">Minutos de ejercicio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Calorías Quemadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-2xl font-bold text-red-600">{exerciseStats.total_calories}</div>
                  <p className="text-xs text-gray-500">Total de calorías</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Promedio por Sesión</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-2xl font-bold text-green-600">{exerciseStats.average_duration}</div>
                  <p className="text-xs text-gray-500">Minutos promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Ejercicio Favorito</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-lg font-bold text-purple-600">{exerciseStats.favorite_exercise}</div>
                  <p className="text-xs text-gray-500">Más realizado</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Mascota Más Activa</CardTitle>
                    </CardHeader>
                    <CardContent>
                  <div className="text-lg font-bold text-indigo-600">{exerciseStats.most_active_pet}</div>
                  <p className="text-xs text-gray-500">Más ejercicios</p>
                    </CardContent>
                  </Card>
                </div>
              )}

          {/* Time Series Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Progreso de Ejercicio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'calories') return [`${value} cal`, 'Calorías'];
                          if (name === 'duration') return [`${value} min`, 'Duración'];
                          if (name === 'sessions') return [`${value}`, 'Sesiones'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                        name="Calorías"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="Duración"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Calorías Quemadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Duración (minutos)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Pet Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                Filtrar por Mascota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPetForAnalytics} onValueChange={setSelectedPetForAnalytics}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una mascota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las mascotas</SelectItem>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Historial de Ejercicios
                  </CardTitle>
                </CardHeader>
                <CardContent>
              {getFilteredExerciseSessions().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No hay sesiones de ejercicio registradas</p>
                  <p className="text-sm">Comienza registrando tu primera sesión de ejercicio</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                  {getFilteredExerciseSessions().map((session) => {
                    const IconComponent = getExerciseTypeIcon(session.exercise_type);
                    const exerciseLabel = getExerciseTypeLabel(session.exercise_type);
                    return (
                      <div key={session.id} className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-orange-600" />
                              <span className="font-semibold text-gray-800">
                              {exerciseLabel}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {session.pet_name}
                              </Badge>
                            <Badge className={intensityLevels.find(i => i.value === session.intensity)?.color || 'bg-gray-100 text-gray-800'}>
                              {intensityLevels.find(i => i.value === session.intensity)?.label || session.intensity}
                            </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(session.date).toLocaleDateString('es-GT')}
                            </span>
                          </div>
                          
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {session.duration_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {session.calories_burned} cal
                          </div>
                        </div>
                          
                          {session.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{session.notes}"</p>
                          )}
                        </div>
                    );
                  })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
};

export default Trazabilidad;
