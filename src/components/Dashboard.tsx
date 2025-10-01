import React, { useState, useEffect } from 'react';
import { 
  Calendar, Heart, Activity, Bell, TrendingUp, Clock, LogOut, 
  Stethoscope, Utensils, ShoppingBag, Package, Users, Settings,
  BarChart3, Target, Award, Zap, MapPin, Star, Plus, ArrowUpRight, 
  ArrowDownRight, Eye, MessageCircle, ShoppingCart, CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedingNotification from './FeedingNotification';
import NotificationBell from './NotificationBell';
import PageHeader from './PageHeader';
import { supabase } from '@/lib/supabase';
import '../services/AutoCompleteService'; // Initialize the auto-complete service
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  image_url?: string;
}

interface DashboardStats {
  totalPets: number;
  totalExerciseSessions: number;
  totalVeterinaryVisits: number;
  totalFeedingSchedules: number;
  avgExerciseMinutes: number;
  totalCaloriesBurned: number;
  upcomingAppointments: number;
  activeFeedingSchedules: number;
  totalOrders: number;
  totalSpent: number;
  totalReminders: number;
  activeBreedingMatches: number;
  totalAdoptionRequests: number;
}

interface ChartData {
  date: string;
  exercise: number;
  calories: number;
  vetVisits: number;
  feeding: number;
}

interface MonthlyData {
  month: string;
  exercise: number;
  vetVisits: number;
  orders: number;
  spent: number;
}

interface PetActivityData {
  name: string;
  exercise: number;
  vetVisits: number;
  feeding: number;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // Fetch user profile data (same as Ajustes component)
  const { data: userProfile } = useUserProfile(user?.id);
  
  // Get user's display name from profile data
  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    totalExerciseSessions: 0,
    totalVeterinaryVisits: 0,
    totalFeedingSchedules: 0,
    avgExerciseMinutes: 0,
    totalCaloriesBurned: 0,
    upcomingAppointments: 0,
    activeFeedingSchedules: 0,
    totalOrders: 0,
    totalSpent: 0,
    totalReminders: 0,
    activeBreedingMatches: 0,
    totalAdoptionRequests: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [petActivityData, setPetActivityData] = useState<PetActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);


  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load pets
      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);
      
      setPets(petsData || []);

      // Load exercise sessions stats
      const { data: exerciseData } = await supabase
        .from('exercise_sessions')
        .select('duration_minutes, calories_burned')
        .eq('owner_id', user?.id);

      // Load veterinary visits count
      const { data: vetData } = await supabase
        .from('veterinary_sessions')
        .select('id')
        .eq('owner_id', user?.id);

      // Load feeding schedules count
      const { data: feedingData } = await supabase
        .from('pet_feeding_schedules')
        .select('id, is_active')
        .eq('owner_id', user?.id);

      const exerciseSessions = exerciseData || [];
      const veterinaryVisits = vetData || [];
      const feedingSchedules = feedingData || [];

      const avgExerciseMinutes = exerciseSessions.length > 0 
        ? Math.round(exerciseSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / exerciseSessions.length)
        : 0;

      const totalCaloriesBurned = exerciseSessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);

      // Generate chart data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'MMM dd'),
          exercise: Math.floor(Math.random() * 5) + 1, // Mock data for now
          calories: Math.floor(Math.random() * 300) + 100,
          vetVisits: Math.floor(Math.random() * 2),
          feeding: Math.floor(Math.random() * 3) + 1
        };
      });

      // Generate monthly data for the last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subDays(new Date(), (5 - i) * 30);
        return {
          month: format(date, 'MMM'),
          exercise: Math.floor(Math.random() * 20) + 10,
          vetVisits: Math.floor(Math.random() * 5) + 1,
          orders: Math.floor(Math.random() * 8) + 2,
          spent: Math.floor(Math.random() * 500) + 100
        };
      });

      // Generate pet activity data
      const petActivity = petsData?.map(pet => ({
        name: pet.name,
        exercise: Math.floor(Math.random() * 10) + 1,
        vetVisits: Math.floor(Math.random() * 3) + 1,
        feeding: Math.floor(Math.random() * 5) + 2
      })) || [];

      setStats({
        totalPets: petsData?.length || 0,
        totalExerciseSessions: exerciseSessions.length,
        totalVeterinaryVisits: veterinaryVisits.length,
        totalFeedingSchedules: feedingSchedules.length,
        avgExerciseMinutes,
        totalCaloriesBurned,
        upcomingAppointments: 0, // TODO: Calculate from appointment dates
        activeFeedingSchedules: feedingSchedules.filter(schedule => schedule.is_active).length,
        totalOrders: Math.floor(Math.random() * 15) + 5, // Mock data
        totalSpent: Math.floor(Math.random() * 2000) + 500, // Mock data
        totalReminders: Math.floor(Math.random() * 8) + 3, // Mock data
        activeBreedingMatches: Math.floor(Math.random() * 5) + 1, // Mock data
        totalAdoptionRequests: Math.floor(Math.random() * 3) + 1 // Mock data
      });

      setChartData(last7Days);
      setMonthlyData(last6Months);
      setPetActivityData(petActivity);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('user_role');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const platformSections = [
    {
      id: 'trazabilidad',
      title: 'Ejercicio',
      description: 'Registra y analiza el ejercicio de tus mascotas',
      icon: Activity,
      color: 'from-green-500 to-teal-600',
      stats: `${stats.totalExerciseSessions} sesiones`,
      action: 'Ver Ejercicio'
    },
    {
      id: 'feeding-schedules',
      title: 'Nutrición',
      description: 'Gestiona horarios de alimentación automática',
      icon: Utensils,
      color: 'from-emerald-500 to-green-600',
      stats: `${stats.activeFeedingSchedules} horarios activos`,
      action: 'Ver Nutrición'
    },
    {
      id: 'veterinaria',
      title: 'Veterinaria',
      description: 'Registra citas y análisis veterinarios',
      icon: Stethoscope,
      color: 'from-red-500 to-pink-600',
      stats: `${stats.totalVeterinaryVisits} visitas`,
      action: 'Ver Veterinaria'
    },
    {
      id: 'recordatorios',
      title: 'Recordatorios',
      description: 'Gestiona recordatorios para el cuidado de tus mascotas',
      icon: Bell,
      color: 'from-purple-500 to-indigo-600',
      stats: 'Recordatorios activos',
      action: 'Ver Recordatorios'
    },
    {
      id: 'parejas',
      title: 'Parejas',
      description: 'Encuentra la pareja perfecta para tu mascota',
      icon: Heart,
      color: 'from-pink-500 to-purple-600',
      stats: 'Pet Tinder',
      action: 'Ver Parejas'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Compras y productos para mascotas',
      icon: ShoppingBag,
      color: 'from-orange-500 to-red-600',
      stats: 'Productos disponibles',
      action: 'Ver Marketplace'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user has pets, redirect to PetRoom for gamified experience
  if (pets && pets.length > 0) {
    window.location.href = '/pet-room';
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Feeding Notifications */}
      <FeedingNotification />
      
      {/* Header */}
      <PageHeader 
        title={`¡Bienvenido, ${getUserDisplayName()}!`}
        subtitle="Tu plataforma integral para el cuidado de mascotas"
        gradient="from-purple-600 to-pink-600"
        showNotifications={false}
      >
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">
              <span className="hidden sm:inline">{stats.totalPets} mascota{stats.totalPets !== 1 ? 's' : ''}</span>
              <span className="sm:hidden">{stats.totalPets} mascota{stats.totalPets !== 1 ? 's' : ''}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">
              <span className="hidden sm:inline">{stats.totalExerciseSessions} sesiones de ejercicio</span>
              <span className="sm:hidden">{stats.totalExerciseSessions} ejercicio</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">
              <span className="hidden sm:inline">{stats.totalVeterinaryVisits} visitas veterinarias</span>
              <span className="sm:hidden">{stats.totalVeterinaryVisits} veterinario</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="bg-white/20 text-white border-white/40 hover:bg-white/30 hover:text-white backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
          </Button>
        </div>
      </PageHeader>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 md:w-5 md:h-5" />
              <div className="flex items-center text-green-200">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs">+12%</span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold">{stats.totalExerciseSessions}</div>
            <div className="text-xs md:text-sm opacity-90">Sesiones de Ejercicio</div>
            <div className="text-xs opacity-75 mt-1">{stats.totalCaloriesBurned} calorías quemadas</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <Utensils className="w-4 h-4 md:w-5 md:h-5" />
              <div className="flex items-center text-orange-200">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs">+8%</span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold">{stats.activeFeedingSchedules}</div>
            <div className="text-xs md:text-sm opacity-90">Horarios Activos</div>
            <div className="text-xs opacity-75 mt-1">Alimentación automatizada</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <Stethoscope className="w-4 h-4 md:w-5 md:h-5" />
              <div className="flex items-center text-red-200">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs">+5%</span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold">{stats.totalVeterinaryVisits}</div>
            <div className="text-xs md:text-sm opacity-90">Visitas Veterinarias</div>
            <div className="text-xs opacity-75 mt-1">Historial médico completo</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              <div className="flex items-center text-blue-200">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs">+15%</span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold">${stats.totalSpent}</div>
            <div className="text-xs md:text-sm opacity-90">Total Gastado</div>
            <div className="text-xs opacity-75 mt-1">{stats.totalOrders} órdenes completadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Activity Trends Chart */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              Tendencias de Actividad (Últimos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'exercise' ? 'Ejercicio' : name === 'calories' ? 'Calorías' : name
                  ]}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Area type="monotone" dataKey="exercise" stroke="#10b981" fillOpacity={1} fill="url(#colorExercise)" />
                <Area type="monotone" dataKey="calories" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCalories)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Overview */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              Resumen Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'exercise' ? 'Ejercicio' : 
                    name === 'vetVisits' ? 'Visitas Veterinarias' : 
                    name === 'orders' ? 'Órdenes' : 
                    name === 'spent' ? 'Gastado' : name
                  ]}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Legend />
                <Bar dataKey="exercise" fill="#10b981" name="Ejercicio" />
                <Bar dataKey="vetVisits" fill="#ef4444" name="Visitas Veterinarias" />
                <Bar dataKey="orders" fill="#3b82f6" name="Órdenes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pet Activity and Platform Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Pet Activity Chart */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
              Actividad por Mascota
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 pr-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={petActivityData}
                  cx="60%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, exercise }) => `${name}: ${exercise}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="exercise"
                >
                  {petActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444', '#3b82f6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} sesiones`, 
                    name === 'exercise' ? 'Ejercicio' : name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Sections */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              Secciones de la Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {platformSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div 
                  key={section.id}
                  className={`bg-gradient-to-r ${section.color} rounded-xl p-3 md:p-4 text-white cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => navigate(`/client-dashboard?section=${section.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{section.title}</h3>
                        <p className="text-xs md:text-sm opacity-90">{section.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs md:text-sm opacity-90">{section.stats}</div>
                      <div className="text-xs opacity-75">{section.action}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
            Análisis Avanzado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs md:text-sm">Resumen</TabsTrigger>
              <TabsTrigger value="health" className="text-xs md:text-sm">Salud</TabsTrigger>
              <TabsTrigger value="spending" className="text-xs md:text-sm">Gastos</TabsTrigger>
              <TabsTrigger value="social" className="text-xs md:text-sm">Social</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4 md:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-xl">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 text-sm md:text-base">Ejercicio</h3>
                      <p className="text-xs md:text-sm text-green-600">{stats.totalExerciseSessions} sesiones</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Promedio diario</span>
                      <span className="font-medium text-green-800">{Math.round(stats.totalExerciseSessions / 7)} min</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">Visibilidad</h3>
                      <p className="text-sm text-blue-600">{stats.activeBreedingMatches} matches activos</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Perfil completo</span>
                      <span className="font-medium text-blue-800">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800">Social</h3>
                      <p className="text-sm text-purple-600">{stats.totalAdoptionRequests} solicitudes</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Interacciones</span>
                      <span className="font-medium text-purple-800">+23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Salud Veterinaria
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-red-700">Visitas este mes</span>
                      <span className="font-medium text-red-800">{Math.floor(stats.totalVeterinaryVisits / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Próxima cita</span>
                      <span className="font-medium text-red-800">15 días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Vacunas al día</span>
                      <Badge className="bg-green-100 text-green-800">Sí</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Nutrición
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Horarios activos</span>
                      <span className="font-medium text-orange-800">{stats.activeFeedingSchedules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Comidas hoy</span>
                      <span className="font-medium text-orange-800">3/4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Estado</span>
                      <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spending" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">Marketplace</h3>
                      <p className="text-2xl font-bold text-green-900">${Math.floor(stats.totalSpent * 0.6)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">{stats.totalOrders} órdenes completadas</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Stethoscope className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">Veterinaria</h3>
                      <p className="text-2xl font-bold text-red-900">${Math.floor(stats.totalSpent * 0.3)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-700">{stats.totalVeterinaryVisits} visitas este año</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-800">Otros</h3>
                      <p className="text-2xl font-bold text-blue-900">${Math.floor(stats.totalSpent * 0.1)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">Servicios adicionales</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-pink-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Parejas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-pink-700">Matches activos</span>
                      <span className="font-medium text-pink-800">{stats.activeBreedingMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Solicitudes enviadas</span>
                      <span className="font-medium text-pink-800">{Math.floor(stats.activeBreedingMatches / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Perfil completo</span>
                      <Badge className="bg-green-100 text-green-800">100%</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Adopción
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Solicitudes enviadas</span>
                      <span className="font-medium text-purple-800">{stats.totalAdoptionRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">En proceso</span>
                      <span className="font-medium text-purple-800">{Math.floor(stats.totalAdoptionRequests / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Favoritos</span>
                      <span className="font-medium text-purple-800">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;