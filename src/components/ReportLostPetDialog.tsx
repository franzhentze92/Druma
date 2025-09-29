import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Phone, Mail, DollarSign, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimpleMap from './SimpleMap';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  color: string;
  image_url?: string;
}

interface ReportLostPetDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportLostPetDialog: React.FC<ReportLostPetDialogProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'select-pet' | 'location' | 'details'>('select-pet');
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationText, setLocationText] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's pets
  useEffect(() => {
    if (open && user?.id) {
      fetchUserPets();
    }
  }, [open, user?.id]);

  const fetchUserPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error('Error fetching user pets:', error);
      setError('Error al cargar tus mascotas');
    }
  };

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setStep('location');
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // Try to get address from coordinates (simplified)
    setLocationText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleSubmit = async () => {
    if (!selectedPet || !selectedLocation || !lastSeenDate || !contactPhone) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('lost_pets')
        .insert({
          owner_id: user?.id,
          name: selectedPet.name,
          species: selectedPet.species,
          breed: selectedPet.breed,
          age: selectedPet.age,
          color: selectedPet.color,
          last_seen: lastSeenDate,
          last_location: locationText,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          description: description,
          contact_phone: contactPhone,
          contact_email: contactEmail || null,
          reward: reward ? parseFloat(reward) : null,
          image_url: selectedPet.image_url,
          status: 'lost'
        });

      if (error) throw error;

      // Reset form
      setSelectedPet(null);
      setSelectedLocation(null);
      setLocationText('');
      setLastSeenDate('');
      setDescription('');
      setContactPhone('');
      setContactEmail('');
      setReward('');
      setStep('select-pet');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error reporting lost pet:', error);
      setError('Error al reportar la mascota perdida. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('select-pet');
    setSelectedPet(null);
    setSelectedLocation(null);
    setLocationText('');
    setLastSeenDate('');
    setDescription('');
    setContactPhone('');
    setContactEmail('');
    setReward('');
    setError('');
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Reportar Mascota Perdida
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para reportar una mascota perdida y ayudar a encontrarla.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Select Pet */}
        {step === 'select-pet' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Selecciona tu mascota</h3>
              <p className="text-gray-600 text-sm mb-4">
                Elige la mascota que se perdió de tu lista de mascotas registradas.
              </p>
            </div>

            {userPets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes mascotas registradas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Necesitas registrar una mascota antes de poder reportarla como perdida.
                  </p>
                  <Button variant="outline" onClick={handleClose}>
                    Cerrar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePetSelect(pet)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {pet.image_url ? (
                          <img
                            src={pet.image_url}
                            alt={pet.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">🐾</span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {pet.species}
                              </Badge>
                              {pet.breed && <span>{pet.breed}</span>}
                            </div>
                            {pet.age && <p>{pet.age} años</p>}
                            {pet.color && <p>Color: {pet.color}</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Location */}
        {step === 'location' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Selecciona la ubicación</h3>
                <p className="text-gray-600 text-sm">
                  Haz clic en el mapa para marcar donde se perdió tu mascota.
                </p>
              </div>
              <Button variant="outline" onClick={() => setStep('select-pet')}>
                ← Volver
              </Button>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border">
              <SimpleMap
                lostPets={[]}
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                isSelectingLocation={true}
              />
            </div>

            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">
                  ✅ Ubicación seleccionada: {locationText}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep('details')}
                disabled={!selectedLocation}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Detalles del reporte</h3>
                <p className="text-gray-600 text-sm">
                  Completa la información adicional sobre cuándo y cómo se perdió tu mascota.
                </p>
              </div>
              <Button variant="outline" onClick={() => setStep('location')}>
                ← Volver
              </Button>
            </div>

            {/* Selected Pet Info */}
            {selectedPet && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {selectedPet.image_url ? (
                      <img
                        src={selectedPet.image_url}
                        alt={selectedPet.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">🐾</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{selectedPet.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedPet.species} • {selectedPet.breed} • {selectedPet.age} años
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastSeenDate">Fecha cuando se perdió *</Label>
                <Input
                  id="lastSeenDate"
                  type="date"
                  value={lastSeenDate}
                  onChange={(e) => setLastSeenDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Teléfono de contacto *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+502 1234-5678"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email de contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="reward">Recompensa (opcional)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción adicional</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe las circunstancias en las que se perdió tu mascota, características distintivas, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Reportando...' : 'Reportar Mascota Perdida'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportLostPetDialog;
