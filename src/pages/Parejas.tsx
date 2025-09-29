import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  PawPrint, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Star,
  MessageCircle,
  User,
  Eye,
  X,
  Check,
  Clock,
  Users,
  Send
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BreedingChatModal from '@/components/BreedingChatModal';
import PageHeader from '@/components/PageHeader';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
  color: string;
  image_url?: string;
  owner_id: string;
  available_for_breeding?: boolean;
  owner?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

interface BreedingMatch {
  id: string;
  pet_id: string;
  potential_partner_id: string;
  owner_id: string;
  partner_owner_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'matched';
  created_at: string;
  updated_at: string;
  pet?: Pet;
  potential_partner?: Pet;
  partner_owner?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

const Parejas: React.FC = () => {
  const { user } = useAuth();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [myMatches, setMyMatches] = useState<BreedingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterBreed, setFilterBreed] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [selectedPetDetails, setSelectedPetDetails] = useState<Pet | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<BreedingMatch[]>([]);
  const [sentRequests, setSentRequests] = useState<BreedingMatch[]>([]);
  const [showPetSelectionModal, setShowPetSelectionModal] = useState(false);
  const [selectedPetForRequest, setSelectedPetForRequest] = useState<Pet | null>(null);
  const [targetPetForRequest, setTargetPetForRequest] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState('pet-tinder');
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedMatchForChat, setSelectedMatchForChat] = useState<BreedingMatch | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load my pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);

      if (petsError) throw petsError;
      setMyPets(petsData || []);

      // Load available pets for breeding
      try {
        console.log('Loading available pets for breeding...');
        
        // First, let's try a simple query to see all pets
        const { data: allPetsData, error: allPetsError } = await supabase
          .from('pets')
          .select('*');
        
        console.log('All pets:', allPetsData);
        console.log('All pets error:', allPetsError);
        
        // Now try the breeding query - first without the relationship
        const { data: availableData, error: availableError } = await supabase
          .from('pets')
          .select('*')
          .eq('available_for_breeding', true);

        console.log('Available pets data:', availableData);
        console.log('Available pets error:', availableError);

        if (availableError) {
          // Check if it's the column doesn't exist error
          if (availableError.code === '42703') {
            console.log('available_for_breeding column does not exist yet. Please run the database setup script.');
            toast.error('La columna de disponibilidad para reproducción no existe. Ejecuta el esquema de base de datos primero.');
            setAvailablePets([]);
          } else {
            throw availableError;
          }
        } else {
          console.log('Setting available pets:', availableData);
          setAvailablePets(availableData || []);
        }
      } catch (error: any) {
        console.error('Error loading available pets:', error);
        toast.error('Error al cargar mascotas disponibles');
        setAvailablePets([]);
      }

      // Load my breeding matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('breeding_matches')
        .select(`
          *,
          pet:pets!breeding_matches_pet_id_fkey(*),
          potential_partner:pets!breeding_matches_potential_partner_id_fkey(*)
        `)
        .or(`owner_id.eq.${user?.id},partner_owner_id.eq.${user?.id}`);

      if (matchesError) {
        console.log('Matches error (table may not exist yet):', matchesError);
        setMyMatches([]);
        setReceivedRequests([]);
        setSentRequests([]);
      } else {
        const allMatches = matchesData || [];
        
        // Get user profiles for partner owners
        const partnerOwnerIds = [...new Set(allMatches.map(match => match.partner_owner_id))];
        let partnerProfiles = {};
        
        if (partnerOwnerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('user_id, full_name, phone')
            .in('user_id', partnerOwnerIds);
          
          if (profilesData) {
            partnerProfiles = profilesData.reduce((acc, profile) => {
              acc[profile.user_id] = profile;
              return acc;
            }, {});
          }
        }
        
        // Add partner profiles to matches
        const enrichedMatches = allMatches.map(match => ({
          ...match,
          partner_owner: partnerProfiles[match.partner_owner_id]
        }));
        
        setMyMatches(enrichedMatches);
        
        // Separate received and sent requests
        const received = enrichedMatches.filter(match => match.partner_owner_id === user?.id);
        const sent = enrichedMatches.filter(match => match.owner_id === user?.id);
        
        setReceivedRequests(received);
        setSentRequests(sent);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (petId: string) => {
    if (!user) {
      toast.error('Debes estar autenticado para enviar solicitudes');
      return;
    }

    const potentialPartner = availablePets.find(p => p.id === petId);
    if (!potentialPartner) {
      toast.error('No se pudo encontrar la mascota');
      return;
    }

    // Check if user has pets available for breeding
    const myBreedingPets = myPets.filter(pet => pet.available_for_breeding);
    if (myBreedingPets.length === 0) {
      toast.error('No tienes mascotas marcadas como disponibles para reproducción');
      return;
    }

    // If only one pet available, use it directly
    if (myBreedingPets.length === 1) {
      await sendLoveRequest(myBreedingPets[0], potentialPartner);
    } else {
      // Show pet selection modal
      setTargetPetForRequest(potentialPartner);
      setShowPetSelectionModal(true);
    }
  };

  const sendLoveRequest = async (myPet: Pet, targetPet: Pet) => {
    try {
      const { error } = await supabase
        .from('breeding_matches')
        .insert({
          pet_id: myPet.id,
          potential_partner_id: targetPet.id,
          owner_id: user?.id,
          partner_owner_id: targetPet.owner_id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '42P01') {
          toast.error('La tabla de parejas no existe. Por favor, ejecuta el esquema de base de datos primero.');
        } else {
          throw error;
        }
      } else {
        toast.success(`💕 Solicitud de amor enviada exitosamente!`, {
          description: `${myPet.name} ha enviado una solicitud de amor a ${targetPet.name}. Espera la respuesta del dueño.`,
          duration: 5000,
        });
        // Remove from available pets to avoid duplicate requests
        setAvailablePets(prev => prev.filter(p => p.id !== targetPet.id));
        // Reload data to update requests
        loadData();
      }
    } catch (error: any) {
      console.error('Error sending love request:', error);
      toast.error('❌ Error al enviar la solicitud de amor', {
        description: 'No se pudo enviar la solicitud. Intenta nuevamente o verifica tu conexión.',
        duration: 4000,
      });
    }
  };

  const handleReject = (petId: string) => {
    setAvailablePets(prev => prev.filter(p => p.id !== petId));
    toast.info('Mascota rechazada');
  };

  const handleViewDetails = (pet: Pet) => {
    setSelectedPetDetails(pet);
    setShowDetailsModal(true);
  };


  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('breeding_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('💕 Solicitud de amor aceptada!', {
        description: '¡Felicidades! La solicitud de amor ha sido aceptada. Puedes contactar al dueño para coordinar.',
        duration: 5000,
      });
      loadData();
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('❌ Error al aceptar la solicitud', {
        description: 'No se pudo aceptar la solicitud. Intenta nuevamente.',
        duration: 4000,
      });
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('breeding_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;

      toast.info('❌ Solicitud de amor rechazada', {
        description: 'La solicitud de amor ha sido rechazada. No te preocupes, hay muchas otras mascotas disponibles.',
        duration: 4000,
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Error al rechazar la solicitud');
    }
  };

  const handleOpenChat = (match: BreedingMatch) => {
    setSelectedMatchForChat(match);
    setShowChatModal(true);
  };

  const filteredPets = availablePets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === 'all' || pet.species === filterSpecies;
    const matchesBreed = filterBreed === 'all' || pet.breed === filterBreed;
    const matchesGender = filterGender === 'all' || pet.gender === filterGender;
    const matchesAge = filterAge === 'all' || 
                      (filterAge === 'young' && pet.age <= 2) ||
                      (filterAge === 'adult' && pet.age > 2 && pet.age <= 6) ||
                      (filterAge === 'senior' && pet.age > 6);

    return matchesSearch && matchesSpecies && matchesBreed && matchesGender && matchesAge;
  });

  const pendingMatches = myMatches.filter(match => match.status === 'pending');
  const acceptedMatches = myMatches.filter(match => match.status === 'accepted');
  const rejectedMatches = myMatches.filter(match => match.status === 'rejected');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader 
        title="Parejas"
        subtitle="Encuentra la pareja perfecta para tu mascota"
        gradient="from-pink-500 to-purple-600"
      />


      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pet-tinder" className="flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Catálogo de Parejas
          </TabsTrigger>
          <TabsTrigger value="solicitudes-enviadas" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Solicitudes Enviadas
          </TabsTrigger>
          <TabsTrigger value="solicitudes-recibidas" className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Solicitudes Recibidas
          </TabsTrigger>
          <TabsTrigger value="mis-parejas" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Mis Parejas
          </TabsTrigger>
        </TabsList>

        {/* Pet Tinder Tab */}
        <TabsContent value="pet-tinder" className="space-y-6">
          {/* Filters */}
          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="search">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Buscar mascotas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="species">Especie</Label>
                      <Select value={filterSpecies} onValueChange={setFilterSpecies}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="Perro">Perro</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="breed">Raza</Label>
                      <Select value={filterBreed} onValueChange={setFilterBreed}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {Array.from(new Set(availablePets.map(p => p.breed))).map(breed => (
                            <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Género</Label>
                      <Select value={filterGender} onValueChange={setFilterGender}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="macho">Macho</SelectItem>
                          <SelectItem value="hembra">Hembra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Edad</Label>
                      <Select value={filterAge} onValueChange={setFilterAge}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="young">Joven (≤2 años)</SelectItem>
                          <SelectItem value="adult">Adulto (3-6 años)</SelectItem>
                            <SelectItem value="senior">Senior (&gt;6 años)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pet Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredPets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200 relative">
                      {pet.image_url ? (
                        <img
                          src={pet.image_url}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PawPrint className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-white text-gray-800 text-xs px-1 py-0">
                          {pet.age}a
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-semibold truncate">{pet.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {pet.gender === 'macho' ? 'M' : 'H'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-xs mb-1 truncate">{pet.breed}</p>
                      <p className="text-gray-500 text-xs mb-2 truncate">{pet.color}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">Ubicación disponible</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(pet)}
                          className="flex-1 text-xs h-7"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleLike(pet.id)}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-xs h-7"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Solicitar Amor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPets.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mascotas disponibles</h3>
                    <p className="text-gray-600">
                      No se encontraron mascotas compatibles con los filtros aplicados.
                    </p>
                  </CardContent>
                </Card>
              )}
        </TabsContent>

        {/* Solicitudes Recibidas Tab */}
        <TabsContent value="solicitudes-recibidas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                    <p className="text-2xl font-bold text-gray-900">{receivedRequests.length}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {receivedRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aceptadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {receivedRequests.filter(r => r.status === 'accepted').length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes recibidas</h3>
                  <p className="text-gray-600">
                    Las solicitudes de amor que otros usuarios envíen para tus mascotas aparecerán aquí.
                  </p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Pet Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {request.pet?.image_url ? (
                          <img
                            src={request.pet.image_url}
                            alt={request.pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PawPrint className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Solicitud para {request.pet?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              De {request.potential_partner?.name} ({request.potential_partner?.breed})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Enviado el {new Date(request.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === 'pending' && 'Pendiente'}
                            {request.status === 'accepted' && 'Aceptada'}
                            {request.status === 'rejected' && 'Rechazada'}
                          </Badge>
                        </div>

                        {/* Owner Info */}
                        {request.partner_owner && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">
                              Dueño: {request.partner_owner.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Teléfono: {request.partner_owner.phone}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex space-x-3 mt-4">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleAcceptMatch(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aceptar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectMatch(request.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <div className="mt-4">
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenChat(request)}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Contactar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Solicitudes Enviadas Tab */}
        <TabsContent value="solicitudes-enviadas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
                    <p className="text-2xl font-bold text-gray-900">{sentRequests.length}</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {sentRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aceptadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {sentRequests.filter(r => r.status === 'accepted').length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No has enviado solicitudes</h3>
                  <p className="text-gray-600">
                    Las solicitudes de amor que envíes a otros usuarios aparecerán aquí.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* My Pet Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {request.pet?.image_url ? (
                          <img
                            src={request.pet.image_url}
                            alt={request.pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PawPrint className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Solicitud de {request.pet?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Para {request.potential_partner?.name} ({request.potential_partner?.breed})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Enviado el {new Date(request.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === 'pending' && 'Pendiente'}
                            {request.status === 'accepted' && 'Aceptada'}
                            {request.status === 'rejected' && 'Rechazada'}
                          </Badge>
                        </div>

                        {/* Partner Owner Info */}
                        {request.partner_owner && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">
                              Dueño: {request.partner_owner.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Teléfono: {request.partner_owner.phone}
                            </p>
                          </div>
                        )}

                        {/* Status Message */}
                        {request.status === 'pending' && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Esperando respuesta del dueño...
                            </p>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              <Check className="w-4 h-4 inline mr-1" />
                              ¡Tu solicitud fue aceptada! Puedes contactar al dueño.
                            </p>
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <X className="w-4 h-4 inline mr-1" />
                              Tu solicitud fue rechazada.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Mis Parejas Tab */}
        <TabsContent value="mis-parejas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingMatches.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aceptados</p>
                    <p className="text-2xl font-bold text-green-600">{acceptedMatches.length}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-purple-600">{myMatches.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {myMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        {match.potential_partner?.image_url ? (
                          <img
                            src={match.potential_partner.image_url}
                            alt={match.potential_partner.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <PawPrint className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{match.potential_partner?.name}</h3>
                        <p className="text-sm text-gray-600">{match.potential_partner?.breed}</p>
                        <p className="text-xs text-gray-500">
                          Dueño: {match.partner_owner?.full_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(match.status)}>
                        {getStatusLabel(match.status)}
                      </Badge>
                      
                      {match.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectMatch(match.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAcceptMatch(match.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {match.status === 'accepted' && (
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenChat(match)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contactar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myMatches.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes parejas aún</h3>
                <p className="text-gray-600">
                  Ve a Pet Tinder para comenzar a buscar parejas para tus mascotas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pet Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              Detalles de {selectedPetDetails?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPetDetails && (
            <div className="space-y-6">
              {/* Pet Image */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {selectedPetDetails.image_url ? (
                    <img
                      src={selectedPetDetails.image_url}
                      alt={selectedPetDetails.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Pet Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                    <p className="text-lg font-semibold">{selectedPetDetails.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Especie</Label>
                    <p className="text-sm">{selectedPetDetails.species}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Raza</Label>
                    <p className="text-sm">{selectedPetDetails.breed}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Género</Label>
                    <Badge variant="outline">
                      {selectedPetDetails.gender === 'macho' ? 'Macho' : 'Hembra'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Edad</Label>
                    <p className="text-sm">{selectedPetDetails.age} años</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Peso</Label>
                    <p className="text-sm">{selectedPetDetails.weight} kg</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Color</Label>
                    <p className="text-sm">{selectedPetDetails.color}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Disponible para reproducción</Label>
                    <Badge className={selectedPetDetails.available_for_breeding ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedPetDetails.available_for_breeding ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              {selectedPetDetails.owner && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Información del Dueño</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                      <p className="text-sm">{selectedPetDetails.owner.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                      <p className="text-sm">{selectedPetDetails.owner.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => handleLike(selectedPetDetails.id)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Solicitar Amor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pet Selection Modal */}
      <Dialog open={showPetSelectionModal} onOpenChange={setShowPetSelectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              Seleccionar tu mascota
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecciona cuál de tus mascotas enviará la solicitud de amor a {targetPetForRequest?.name}:
            </p>
            
            <div className="space-y-3">
              {myPets.filter(pet => pet.available_for_breeding).map((pet) => (
                <div
                  key={pet.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPetForRequest?.id === pet.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPetForRequest(pet)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {pet.image_url ? (
                        <img
                          src={pet.image_url}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PawPrint className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{pet.name}</h4>
                      <p className="text-sm text-gray-600">{pet.breed} • {pet.age} años</p>
                    </div>
                    {selectedPetForRequest?.id === pet.id && (
                      <Check className="w-5 h-5 text-pink-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={async () => {
                  if (selectedPetForRequest && targetPetForRequest) {
                    await sendLoveRequest(selectedPetForRequest, targetPetForRequest);
                    setShowPetSelectionModal(false);
                    setSelectedPetForRequest(null);
                    setTargetPetForRequest(null);
                  }
                }}
                disabled={!selectedPetForRequest}
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                Enviar Solicitud
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPetSelectionModal(false);
                  setSelectedPetForRequest(null);
                  setTargetPetForRequest(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breeding Chat Modal */}
      <BreedingChatModal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setSelectedMatchForChat(null);
        }}
        breedingMatch={selectedMatchForChat}
      />
    </div>
  );
};

export default Parejas;
