import React, { useState } from 'react';
import { Filter, MapPin, Calendar, Heart, PawPrint, Home, Coins, Shield } from 'lucide-react';

interface AdoptionFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const AdoptionFilters: React.FC<AdoptionFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    species: '',
    size: '',
    age: '',
    breed: '',
    personality: '',
    gender: '',
    color: '',
    house_trained: '',
    spayed_neutered: '',
    special_needs: '',
    adoption_fee_max: '',
    distance: 10,
    shelter: '',
    location: ''
  });

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      species: '',
      size: '',
      age: '',
      breed: '',
      personality: '',
      gender: '',
      color: '',
      house_trained: '',
      spayed_neutered: '',
      special_needs: '',
      adoption_fee_max: '',
      distance: 10,
      shelter: '',
      location: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="text-purple-600 mr-2" size={20} />
          <h3 className="text-lg font-bold text-gray-800">Filtros de Búsqueda</h3>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          Limpiar filtros
        </button>
      </div>
      
      {/* Basic Information */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <PawPrint className="w-4 h-4 mr-2 text-purple-600" />
          Información Básica
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especie</label>
            <select 
              value={filters.species}
              onChange={(e) => updateFilter('species', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las especies</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="conejo">Conejo</option>
              <option value="ave">Ave</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
            <select 
              value={filters.size}
              onChange={(e) => updateFilter('size', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tamaños</option>
              <option value="pequeño">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
            <select 
              value={filters.age}
              onChange={(e) => updateFilter('age', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las edades</option>
              <option value="cachorro">Cachorro (0-1 año)</option>
              <option value="joven">Joven (1-3 años)</option>
              <option value="adulto">Adulto (3-7 años)</option>
              <option value="senior">Senior (7+ años)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
            <select 
              value={filters.gender}
              onChange={(e) => updateFilter('gender', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Cualquier género</option>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance & Breed */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <Heart className="w-4 h-4 mr-2 text-purple-600" />
          Apariencia y Raza
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Raza</label>
            <input
              type="text"
              value={filters.breed}
              onChange={(e) => updateFilter('breed', e.target.value)}
              placeholder="Ej: Labrador, Persa..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <select 
              value={filters.color}
              onChange={(e) => updateFilter('color', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los colores</option>
              <option value="negro">Negro</option>
              <option value="blanco">Blanco</option>
              <option value="marrón">Marrón</option>
              <option value="gris">Gris</option>
              <option value="dorado">Dorado</option>
              <option value="atigrado">Atigrado</option>
              <option value="multicolor">Multicolor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personalidad</label>
            <select 
              value={filters.personality}
              onChange={(e) => updateFilter('personality', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las personalidades</option>
              <option value="jugueton">Juguetón</option>
              <option value="tranquilo">Tranquilo</option>
              <option value="protector">Protector</option>
              <option value="carinhoso">Cariñoso</option>
              <option value="energico">Energético</option>
              <option value="independiente">Independiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health & Care */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-purple-600" />
          Salud y Cuidados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entrenado en casa</label>
            <select 
              value={filters.house_trained}
              onChange={(e) => updateFilter('house_trained', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Cualquier estado</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Esterilizado/Castrado</label>
            <select 
              value={filters.spayed_neutered}
              onChange={(e) => updateFilter('spayed_neutered', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Cualquier estado</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Necesidades especiales</label>
            <select 
              value={filters.special_needs}
              onChange={(e) => updateFilter('special_needs', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Cualquier estado</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location & Cost */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-purple-600" />
          Ubicación y Costo
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Ej: Ciudad, Estado..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Costo máximo de adopción</label>
            <select 
              value={filters.adoption_fee_max}
              onChange={(e) => updateFilter('adoption_fee_max', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Sin límite</option>
              <option value="0">Gratis</option>
              <option value="50">Hasta $50</option>
              <option value="100">Hasta $100</option>
              <option value="200">Hasta $200</option>
              <option value="500">Hasta $500</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distancia máxima: {filters.distance} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.distance}
              onChange={(e) => updateFilter('distance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionFilters;