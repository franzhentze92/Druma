import React from 'react';

interface NutritionSession {
  id: string;
  pet_id: string;
  pet_name: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  food_category: string;
  quantity_grams: number;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_fiber: number;
  notes?: string;
  feeding_time?: string;
  created_at: string;
}

interface NutritionProgressChartProps {
  sessions: NutritionSession[];
}

const NutritionProgressChart: React.FC<NutritionProgressChartProps> = ({ sessions }) => {
  console.log('NutritionProgressChart rendered with sessions:', sessions);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay datos de nutrición para mostrar</p>
      </div>
    );
  }

  // Group sessions by date and calculate daily totals
  const dailyData = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        meals: 0
      };
    }
    acc[date].calories += session.total_calories;
    acc[date].protein += session.total_protein;
    acc[date].fat += session.total_fat;
    acc[date].carbs += session.total_carbs;
    acc[date].fiber += session.total_fiber;
    acc[date].meals += 1;
    return acc;
  }, {} as Record<string, any>);

  const dailyChartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Last 14 days

  console.log('Daily chart data:', dailyChartData);

  return (
    <div className="space-y-6">
      {/* Time Series Chart - Daily Calories */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Calorías Diarias</h3>
        <div className="h-64 relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Grid lines */}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1="40"
                y1={40 + (i * 40)}
                x2="100%"
                y2={40 + (i * 40)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* X-axis labels (dates) */}
            {dailyChartData.map((day: any, index) => {
              const x = 40 + (index * (100 - 40) / Math.max(dailyChartData.length - 1, 1));
              return (
                <text
                  key={`date-${index}`}
                  x={x}
                  y="100%"
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform={`translate(0, 20)`}
                >
                  {new Date(day.date).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })}
                </text>
              );
            })}
            
            {/* Y-axis labels (calories) */}
            {(() => {
              const maxCalories = Math.max(...dailyChartData.map((d: any) => d.calories), 100);
              return Array.from({ length: 5 }, (_, i) => {
                const value = (maxCalories / 4) * (4 - i);
                const y = 40 + (i * 40);
                return (
                  <text
                    key={`calorie-${i}`}
                    x="35"
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {Math.round(value)}
                  </text>
                );
              });
            })()}
            
            {/* Calorie line */}
            {dailyChartData.length > 1 && (() => {
              const maxCalories = Math.max(...dailyChartData.map((d: any) => d.calories), 100);
              const points = dailyChartData.map((day: any, index) => {
                const x = 40 + (index * (100 - 40) / Math.max(dailyChartData.length - 1, 1));
                const y = 40 + ((maxCalories - day.calories) / maxCalories) * 160;
                return `${x},${y}`;
              }).join(' ');
              
              return (
                <>
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {dailyChartData.map((day: any, index) => {
                    const x = 40 + (index * (100 - 40) / Math.max(dailyChartData.length - 1, 1));
                    const y = 40 + ((maxCalories - day.calories) / maxCalories) * 160;
                    return (
                      <circle
                        key={`point-${index}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Últimos {dailyChartData.length} días
        </div>
      </div>

      {/* Time Series Chart - Weekly Trends */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencias Semanales</h3>
        <div className="h-64 relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Grid lines */}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1="40"
                y1={40 + (i * 40)}
                x2="100%"
                y2={40 + (i * 40)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Weekly data processing */}
            {(() => {
              const weeklyData = sessions.reduce((acc, session) => {
                const date = new Date(session.date);
                const weekStart = new Date(date.getTime() - (date.getDay() * 24 * 60 * 60 * 1000));
                const weekKey = weekStart.toISOString().split('T')[0];
                
                if (!acc[weekKey]) {
                  acc[weekKey] = {
                    week: `Semana ${Object.keys(acc).length + 1}`,
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0,
                    meals: 0
                  };
                }
                acc[weekKey].calories += session.total_calories;
                acc[weekKey].protein += session.total_protein;
                acc[weekKey].fat += session.total_fat;
                acc[weekKey].carbs += session.total_carbs;
                acc[weekKey].meals += 1;
                return acc;
              }, {} as Record<string, any>);

              const weeklyChartData = Object.values(weeklyData).slice(-4); // Last 4 weeks
              const maxValue = Math.max(...weeklyChartData.map((d: any) => Math.max(d.protein, d.fat, d.carbs)), 50);
              
              return (
                <>
                  {/* X-axis labels */}
                  {weeklyChartData.map((week: any, index) => {
                    const x = 40 + (index * (100 - 40) / Math.max(weeklyChartData.length - 1, 1));
                    return (
                      <text
                        key={`week-${index}`}
                        x={x}
                        y="100%"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        transform={`translate(0, 20)`}
                      >
                        {week.week}
                      </text>
                    );
                  })}
                  
                  {/* Y-axis labels */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const value = (maxValue / 4) * (4 - i);
                    const y = 40 + (i * 40);
                    return (
                      <text
                        key={`value-${i}`}
                        x="35"
                        y={y + 4}
                        textAnchor="end"
                        className="text-xs fill-gray-600"
                      >
                        {Math.round(value)}
                      </text>
                    );
                  })}
                  
                  {/* Multiple lines for different nutrients */}
                  {['protein', 'fat', 'carbs'].map((nutrient, nutrientIndex) => {
                    const colors = ['#f59e0b', '#ef4444', '#8b5cf6'];
                    const points = weeklyChartData.map((week: any, index) => {
                      const x = 40 + (index * (100 - 40) / Math.max(weeklyChartData.length - 1, 1));
                      const y = 40 + ((maxValue - week[nutrient]) / maxValue) * 160;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <g key={nutrient}>
                        <polyline
                          points={points}
                          fill="none"
                          stroke={colors[nutrientIndex]}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {weeklyChartData.map((week: any, index) => {
                          const x = 40 + (index * (100 - 40) / Math.max(weeklyChartData.length - 1, 1));
                          const y = 40 + ((maxValue - week[nutrient]) / maxValue) * 160;
                          return (
                            <circle
                              key={`${nutrient}-point-${index}`}
                              cx={x}
                              cy={y}
                              r="3"
                              fill={colors[nutrientIndex]}
                              stroke="white"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Proteína</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Grasa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Carbohidratos</span>
          </div>
        </div>
      </div>

      {/* Simple Meal Type Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Tipo de Comida</h3>
        <div className="grid grid-cols-2 gap-4">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const count = sessions.filter(s => s.meal_type === mealType).length;
            const total = sessions.length;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const mealName = mealType === 'breakfast' ? 'Desayuno' :
                           mealType === 'lunch' ? 'Almuerzo' :
                           mealType === 'dinner' ? 'Cena' : 'Merienda';
            
            return (
              <div key={mealType} className="text-center">
                <div className="text-2xl mb-2">
                  {mealType === 'breakfast' ? '🌅' : 
                   mealType === 'lunch' ? '🌞' : 
                   mealType === 'dinner' ? '🌙' : '🍪'}
                </div>
                <div className="text-lg font-semibold text-gray-800">{mealName}</div>
                <div className="text-sm text-gray-600">{count} comidas</div>
                <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Food Category Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Categoría de Alimento</h3>
        <div className="space-y-3">
          {Object.entries(
            sessions.reduce((acc, session) => {
              const category = session.food_category || 'other';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, count]) => {
            const total = sessions.length;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={category} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 capitalize">{category}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NutritionProgressChart;