import React from 'react';
import { MapPin, Calendar, Phone, Mail, DollarSign, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface LostPetDetailsModalProps {
  pet: LostPet | null;
  open: boolean;
  onClose: () => void;
}

const LostPetDetailsModal: React.FC<LostPetDetailsModalProps> = ({ pet, open, onClose }) => {
  if (!pet) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Detalles de Mascota Perdida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pet Image and Basic Info */}
          <div className="flex items-start gap-4">
            {pet.image_url ? (
              <img
                src={pet.image_url}
                alt={pet.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-4xl">🐾</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-800">{pet.name}</h3>
                <Badge className={`text-white text-sm ${getStatusColor(pet.status)}`}>
                  {getStatusText(pet.status)}
                </Badge>
              </div>
              
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pet.species}</span>
                  {pet.breed && <span>• {pet.breed}</span>}
                  {pet.age && <span>• {pet.age} años</span>}
                </div>
                {pet.color && <p>Color: {pet.color}</p>}
              </div>
            </div>
          </div>

          {/* Lost Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Información de Pérdida
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span><strong>Perdido:</strong> {formatDate(pet.last_seen)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span><strong>Ubicación:</strong> {pet.last_location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span><strong>Coordenadas:</strong> {pet.latitude.toFixed(6)}, {pet.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {pet.description && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Descripción</h4>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{pet.description}</p>
            </div>
          )}

          {/* Reward */}
          {pet.reward && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Recompensa: ${pet.reward}</span>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Información de Contacto</h4>
            
            <div className="space-y-2">
              {pet.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <a 
                    href={`tel:${pet.contact_phone}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {pet.contact_phone}
                  </a>
                </div>
              )}
              
              {pet.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <a 
                    href={`mailto:${pet.contact_email}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {pet.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {pet.contact_phone && (
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => window.open(`tel:${pet.contact_phone}`, '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            )}
            {pet.contact_email && (
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => window.open(`mailto:${pet.contact_email}`, '_self')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LostPetDetailsModal;
