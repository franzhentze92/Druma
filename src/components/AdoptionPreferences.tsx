import React, { useState } from 'react';
import { Heart, User, Home, Activity, AlertCircle } from 'lucide-react';

const AdoptionPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    experience: '',
    livingSpace: '',
    timeAvailable: '',
    otherPets: false,
    children: false,
    budget: '',
    specialNeeds: false
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Heart className="text-red-500 mr-2" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Preferencias de Adopción</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <User className="inline mr-2" size={16} />
            Experiencia con perros
          </label>
          <div className="space-y-2">
            {['Principiante', 'Intermedio', 'Avanzado'].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="experience"
                  value={level.toLowerCase()}
                  checked={preferences.experience === level.toLowerCase()}
                  onChange={(e) => updatePreference('experience', e.target.value)}
                  className="mr-2 text-purple-600"
                />
                <span className="text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Home className="inline mr-2" size={16} />
            Espacio de vivienda
          </label>
          <select 
            value={preferences.livingSpace}
            onChange={(e) => updatePreference('livingSpace', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Seleccionar...</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa-sin-jardin">Casa sin jardín</option>
            <option value="casa-con-jardin">Casa con jardín</option>
            <option value="finca">Finca/Terreno grande</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Activity className="inline mr-2" size={16} />
            Tiempo disponible diario
          </label>
          <select 
            value={preferences.timeAvailable}
            onChange={(e) => updatePreference('timeAvailable', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Seleccionar...</option>
            <option value="1-2-horas">1-2 horas</option>
            <option value="3-4-horas">3-4 horas</option>
            <option value="5-6-horas">5-6 horas</option>
            <option value="todo-el-dia">Todo el día</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.otherPets}
              onChange={(e) => updatePreference('otherPets', e.target.checked)}
              className="mr-2 text-purple-600"
            />
            <span className="text-gray-700">Tengo otras mascotas</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.children}
              onChange={(e) => updatePreference('children', e.target.checked)}
              className="mr-2 text-purple-600"
            />
            <span className="text-gray-700">Tengo niños en casa</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Presupuesto mensual estimado
          </label>
          <select 
            value={preferences.budget}
            onChange={(e) => updatePreference('budget', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Seleccionar...</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-300">$200 - $300</option>
            <option value="300+">$300+</option>
          </select>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={preferences.specialNeeds}
              onChange={(e) => updatePreference('specialNeeds', e.target.checked)}
              className="mr-2 mt-1 text-purple-600"
            />
            <div>
              <span className="text-gray-700 font-medium">Dispuesto a adoptar perros con necesidades especiales</span>
              <p className="text-sm text-gray-600 mt-1">
                Incluye perros mayores, con discapacidades o condiciones médicas
              </p>
            </div>
          </label>
        </div>
        
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
};

export default AdoptionPreferences;