import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Flame, Clock } from 'lucide-react';

interface ExerciseSession {
  id: string;
  pet_id: string;
  pet_name: string;
  date: string;
  exercise_type: string;
  duration_minutes: number;
  notes?: string;
  calories_burned: number;
  distance_km?: number;
  intensity: 'low' | 'medium' | 'high';
  created_at: string;
}

interface ExerciseProgressChartProps {
  sessions: ExerciseSession[];
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ sessions }) => {
  // Group sessions by week
  const getWeekData = () => {
    const weeks: { [key: string]: { sessions: number; minutes: number; calories: number } } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { sessions: 0, minutes: 0, calories: 0 };
      }
      
      weeks[weekKey].sessions += 1;
      weeks[weekKey].minutes += session.duration_minutes;
      weeks[weekKey].calories += session.calories_burned;
    });
    
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8); // Last 8 weeks
  };

  const weekData = getWeekData();

  // Calculate trends
  const getTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-2);
    const older = data.slice(-4, -2);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const sessionsTrend = getTrend(weekData.map(([, data]) => data.sessions));
  const minutesTrend = getTrend(weekData.map(([, data]) => data.minutes));
  const caloriesTrend = getTrend(weekData.map(([, data]) => data.calories));

  // Simple bar chart component
  const SimpleBarChart = ({ data, label, color }: { data: number; label: string; color: string }) => {
    const maxValue = Math.max(...weekData.map(([, d]) => d[label as keyof typeof d] as number));
    const percentage = maxValue > 0 ? (data / maxValue) * 100 : 0;
    
    return (
      <div className="flex items-end gap-1 h-20">
        <div className="flex-1 flex flex-col items-center">
          <div 
            className={`w-full rounded-t ${color} transition-all duration-300`}
            style={{ height: `${percentage}%` }}
          />
          <span className="text-xs text-gray-500 mt-1">{data}</span>
        </div>
      </div>
    );
  };

  if (weekData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Progreso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No hay datos suficientes para mostrar el progreso</p>
            <p className="text-sm">Registra más sesiones de ejercicio para ver las tendencias</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Progreso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sessions Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sesiones por Semana</span>
                <span className={`text-sm flex items-center gap-1 ${
                  sessionsTrend > 0 ? 'text-green-600' : sessionsTrend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${sessionsTrend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(sessionsTrend).toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-2 h-16">
                {weekData.map(([week, data]) => (
                  <div key={week} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${Math.max(10, (data.sessions / Math.max(...weekData.map(([, d]) => d.sessions))) * 100)}%` 
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{data.sessions}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Minutos por Semana</span>
                <span className={`text-sm flex items-center gap-1 ${
                  minutesTrend > 0 ? 'text-green-600' : minutesTrend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${minutesTrend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(minutesTrend).toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-2 h-16">
                {weekData.map(([week, data]) => (
                  <div key={week} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${Math.max(10, (data.minutes / Math.max(...weekData.map(([, d]) => d.minutes))) * 100)}%` 
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{data.minutes}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calories Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Calorías por Semana</span>
                <span className={`text-sm flex items-center gap-1 ${
                  caloriesTrend > 0 ? 'text-green-600' : caloriesTrend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${caloriesTrend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(caloriesTrend).toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-2 h-16">
                {weekData.map(([week, data]) => (
                  <div key={week} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-orange-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${Math.max(10, (data.calories / Math.max(...weekData.map(([, d]) => d.calories))) * 100)}%` 
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{data.calories}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Distribución por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              sessions.reduce((acc, session) => {
                acc[session.exercise_type] = (acc[session.exercise_type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => {
                const percentage = (count / sessions.length) * 100;
                const exerciseTypes = [
                  { value: 'walking', label: 'Caminata', icon: '🚶', color: 'bg-blue-500' },
                  { value: 'running', label: 'Carrera', icon: '🏃', color: 'bg-red-500' },
                  { value: 'playing', label: 'Juego', icon: '🎾', color: 'bg-green-500' },
                  { value: 'swimming', label: 'Natación', icon: '🏊', color: 'bg-cyan-500' },
                  { value: 'agility', label: 'Agilidad', icon: '🎯', color: 'bg-purple-500' },
                  { value: 'hiking', label: 'Senderismo', icon: '🏔️', color: 'bg-orange-500' },
                  { value: 'fetch', label: 'Buscar', icon: '🥏', color: 'bg-yellow-500' },
                  { value: 'training', label: 'Entrenamiento', icon: '🎓', color: 'bg-indigo-500' },
                ];
                
                const exerciseType = exerciseTypes.find(et => et.value === type);
                
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-2xl">{exerciseType?.icon || '🏃'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{exerciseType?.label || type}</span>
                        <span className="text-sm text-gray-500">{count} sesiones</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${exerciseType?.color || 'bg-gray-500'} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseProgressChart;
