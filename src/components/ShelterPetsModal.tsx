import React from 'react';
import { X, Heart, MapPin, PawPrint, Users } from 'lucide-react';
import { useShelter, useAdoptionPetsByShelter } from '@/hooks/useAdoption';
import { useMyFavorites, useToggleFavorite, useApplyToPet } from '@/hooks/useAdoption';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdoptionPetDetails from './AdoptionPetDetails';

interface ShelterPetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelterId: string;
}

const ShelterPetsModal: React.FC<ShelterPetsModalProps> = ({ isOpen, onClose, shelterId }) => {
  const { user } = useAuth();
  const { data: shelter } = useShelter(shelterId);
  const { data: pets = [] } = useAdoptionPetsByShelter(shelterId);
  const { data: favoriteIds = [] } = useMyFavorites(user?.id);
  const toggleFavorite = useToggleFavorite();
  const applyToPet = useApplyToPet();
  const [detailsPet, setDetailsPet] = React.useState<any | null>(null);

  const isFavorite = (petId: string) => favoriteIds.includes(petId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{shelter?.name || 'Albergue'}</h2>
              {shelter?.location && (
                <div className="flex items-center text-purple-100">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{shelter.location}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mascotas disponibles</h3>
              <p className="text-gray-500">Este albergue no tiene mascotas en adopción en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Mascotas en Adopción ({pets.length})
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
                      {pet.image_url ? (
                        <img 
                          src={pet.image_url} 
                          alt={pet.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-20 h-20 text-purple-400" />
                      )}
                      <button
                        className={`absolute top-2 right-2 rounded-full p-1.5 shadow ${
                          isFavorite(pet.id) ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-red-500'
                        }`}
                        onClick={() => {
                          if (!user?.id) return;
                          toggleFavorite.mutate({ 
                            petId: pet.id, 
                            userId: user.id, 
                            isFavorite: isFavorite(pet.id) 
                          });
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800">{pet.name}</h4>
                        {pet.age && <span className="text-sm text-gray-500">{pet.age} años</span>}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {pet.breed && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            <PawPrint className="w-3 h-3 mr-1" />
                            {pet.breed}
                          </span>
                        )}
                        {pet.size && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                            {pet.size}
                          </span>
                        )}
                      </div>
                      
                      {pet.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{pet.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          {pet.good_with_kids && (
                            <span className="text-xs text-green-600">👶 Niños</span>
                          )}
                          {pet.good_with_dogs && (
                            <span className="text-xs text-blue-600">🐕 Perros</span>
                          )}
                          {pet.good_with_cats && (
                            <span className="text-xs text-purple-600">🐱 Gatos</span>
                          )}
                        </div>
                        <Button
                          onClick={() => setDetailsPet(pet)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-200"
                        >
                          Ver detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pet Details Modal */}
      <AdoptionPetDetails 
        open={!!detailsPet} 
        onClose={() => setDetailsPet(null)} 
        pet={detailsPet}
        isFavorite={detailsPet ? favoriteIds.includes(detailsPet.id) : false}
        onToggleFavorite={() => {
          if (!user?.id || !detailsPet) return;
          toggleFavorite.mutate({ 
            petId: detailsPet.id, 
            userId: user.id, 
            isFavorite: favoriteIds.includes(detailsPet.id) 
          });
        }}
        onApply={() => {
          if (!user?.id || !detailsPet) return;
          applyToPet.mutate({ 
            pet_id: detailsPet.id, 
            applicant_id: user.id, 
            message: null, 
            status: 'pending' 
          });
        }}
      />
    </div>
  );
};

export default ShelterPetsModal;
