import React from 'react';
import { MapPin, Calendar, Phone, Mail, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RealMap from './RealMap';

interface LostPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  color: string;
  last_seen: string;
  last_location: string;
  latitude: number;
  longitude: number;
  description: string;
  contact_phone: string;
  contact_email: string;
  reward?: number;
  image_url?: string;
  status: string;
  created_at: string;
}

interface SimpleMapProps {
  lostPets: LostPet[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  isSelectingLocation?: boolean;
  viewMode?: 'list' | 'map';
  onPetClick?: (pet: LostPet) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  lostPets, 
  onLocationSelect, 
  selectedLocation, 
  isSelectingLocation = false,
  viewMode = 'list',
  onPetClick
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost': return 'bg-red-500';
      case 'found': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-orange-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'lost': return 'Perdido';
      case 'found': return 'Encontrado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border bg-gray-50">
      {/* Map Placeholder */}
      <div className="h-full flex flex-col">
        {/* Map Header */}
        <div className="bg-green-600 text-white p-4 text-center">
          <h3 className="text-lg font-semibold">🗺️ Mapa de Mascotas Perdidas</h3>
          <p className="text-green-100 text-sm">
            {lostPets.length} mascota{lostPets.length !== 1 ? 's' : ''} perdida{lostPets.length !== 1 ? 's' : ''} reportada{lostPets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Interactive Map Area */}
        {isSelectingLocation ? (
          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-green-50">
            {/* Interactive Map Placeholder */}
            <div 
              className="w-full h-full cursor-crosshair relative"
              onClick={(e) => {
                if (onLocationSelect) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // Convert click position to approximate coordinates
                  // Guatemala City area: 14.6349, -90.5069
                  const lat = 14.6349 + (y / rect.height - 0.5) * 0.1; // ±0.05 degrees
                  const lng = -90.5069 + (x / rect.width - 0.5) * 0.1; // ±0.05 degrees
                  
                  onLocationSelect(lat, lng);
                }
              }}
            >
              {/* Map Grid Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-10 grid-rows-10 h-full">
                  {[...Array(100)].map((_, i) => (
                    <div key={i} className="border border-gray-300"></div>
                  ))}
                </div>
              </div>
              
              {/* Map Center Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              
              {/* Click Instructions */}
              <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Haz clic en cualquier lugar del mapa</span>
                </div>
              </div>
              
              {/* Selected Location Marker */}
              {selectedLocation && (
                <div 
                  className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            
            {/* Location Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
              <div className="text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Guatemala City Area</span>
                </div>
                {selectedLocation ? (
                  <div className="text-xs text-green-600">
                    ✅ Ubicación seleccionada: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    Haz clic en el mapa para marcar la ubicación
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          /* Real Map View */
          <div className="flex-1">
            <RealMap
              lostPets={lostPets}
              onLocationSelect={onLocationSelect}
              selectedLocation={selectedLocation}
              isSelectingLocation={isSelectingLocation}
              viewMode={viewMode}
              onPetClick={onPetClick}
            />
          </div>
        ) : (
          /* Lost Pets List */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {lostPets.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay mascotas perdidas</h3>
                <p className="text-gray-500">Sé el primero en reportar una mascota perdida</p>
              </div>
            ) : (
              lostPets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {pet.image_url ? (
                      <img
                        src={pet.image_url}
                        alt={pet.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">🐾</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                        <Badge className={`text-white text-xs ${getStatusColor(pet.status)}`}>
                          {getStatusText(pet.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{pet.species}</span>
                          {pet.breed && <span>• {pet.breed}</span>}
                          {pet.age && <span>• {pet.age} años</span>}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Perdido: {formatDate(pet.last_seen)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{pet.last_location}</span>
                        </div>
                        
                        {pet.reward && (
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="w-3 h-3" />
                            <span>Recompensa: ${pet.reward}</span>
                          </div>
                        )}
                        
                        {pet.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {pet.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 pt-1 border-t">
                          {pet.contact_phone && (
                            <a 
                              href={`tel:${pet.contact_phone}`}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">Llamar</span>
                            </a>
                          )}
                          
                          {pet.contact_email && (
                            <a 
                              href={`mailto:${pet.contact_email}`}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">Email</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMap;
