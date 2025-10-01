import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  Truck, 
  Heart, 
  Star, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package, 
  Stethoscope, 
  Sparkles,
  Gift,
  Smile,
  PawPrint,
  Utensils,
  Gamepad2,
  Shirt,
  Trophy
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface Delivery {
  id: string;
  order_type: 'product' | 'service';
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
    pet_reaction: string;
  }>;
  total_price: number;
  order_date: string;
  delivery_date?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'completed';
  tracking_number?: string;
  provider_name?: string;
  xp_earned: number;
  pet_happiness_bonus: number;
}

const Deliveries: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPet) {
      loadDeliveries();
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      setPets(data || []);
      if (data && data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadDeliveries = async () => {
    if (!selectedPet) return;
    
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockDeliveries: Delivery[] = [
        {
          id: '1',
          order_type: 'product',
          items: [
            {
              name: 'Croquetas Premium',
              category: 'food',
              quantity: 2,
              price: 25.99,
              pet_reaction: '¡Yum! Estas croquetas me encantan 🐕'
            },
            {
              name: 'Pelota Interactiva',
              category: 'toys',
              quantity: 1,
              price: 15.50,
              pet_reaction: '¡Qué divertido! ¡Quiero jugar todo el día! 🎾'
            }
          ],
          total_price: 67.48,
          order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          status: 'delivered',
          tracking_number: 'TRK123456789',
          xp_earned: 13,
          pet_happiness_bonus: 15
        },
        {
          id: '2',
          order_type: 'service',
          items: [
            {
              name: 'Consulta Veterinaria',
              category: 'vet',
              quantity: 1,
              price: 45.00,
              pet_reaction: '¡El doctor me dijo que estoy muy sano! 🏥'
            }
          ],
          total_price: 45.00,
          order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          delivery_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          status: 'completed',
          provider_name: 'Dr. María González',
          xp_earned: 15,
          pet_happiness_bonus: 10
        },
        {
          id: '3',
          order_type: 'product',
          items: [
            {
              name: 'Collar LED',
              category: 'accessories',
              quantity: 1,
              price: 12.99,
              pet_reaction: '¡Me veo súper elegante! ✨'
            }
          ],
          total_price: 12.99,
          order_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
          delivery_date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), // 13 days ago
          status: 'delivered',
          tracking_number: 'TRK987654321',
          xp_earned: 3,
          pet_happiness_bonus: 8
        }
      ];
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Preparando';
      case 'shipped': return 'En camino';
      case 'delivered': return 'Entregado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍖';
      case 'toys': return '🎾';
      case 'accessories': return '🐾';
      case 'health': return '🩺';
      case 'vet': return '🏥';
      case 'grooming': return '🛁';
      case 'training': return '🎓';
      case 'daycare': return '🏡';
      default: return '📦';
    }
  };

  const getPetEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeTab === 'all') return true;
    if (activeTab === 'products') return delivery.order_type === 'product';
    if (activeTab === 'services') return delivery.order_type === 'service';
    return true;
  });

  const totalXP = deliveries.reduce((total, delivery) => total + delivery.xp_earned, 0);
  const totalHappiness = deliveries.reduce((total, delivery) => total + delivery.pet_happiness_bonus, 0);
  const totalSpent = deliveries.reduce((total, delivery) => total + delivery.total_price, 0);

  if (!selectedPet) {
    return (
      <div className="p-6 text-center pb-20">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para ver sus entregas
        </p>
        <Button 
          onClick={() => window.location.href = '/pet-creation'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Crear Mi Primera Mascota
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-20">
      {/* Deliveries Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {selectedPet.image_url ? (
                  <img
                    src={selectedPet.image_url}
                    alt={selectedPet.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                    {getPetEmoji(selectedPet.species)}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">📦</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Entregas de {selectedPet.name}</h2>
                <p className="text-gray-600">Historial de suministros y servicios</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{deliveries.length}</div>
              <div className="text-sm text-gray-600">Entregas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">+{totalXP}</div>
            <div className="text-sm opacity-90">XP Total</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">+{totalHappiness}</div>
            <div className="text-sm opacity-90">Felicidad</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Truck className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <div className="text-sm opacity-90">Total Gastado</div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white p-1 shadow-lg rounded-xl">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Suministros</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Servicios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando entregas...</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-600">No hay entregas aún</p>
              <p className="text-sm text-gray-500 mt-2">¡Compra algunos suministros para {selectedPet.name}!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => (
                <Card key={delivery.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getStatusIcon(delivery.status)}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900">
                              {delivery.order_type === 'product' ? 'Entrega de Suministros' : 'Servicio Completado'}
                            </h3>
                            <Badge className={getStatusColor(delivery.status)}>
                              {getStatusText(delivery.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(delivery.order_date).toLocaleDateString()}
                            {delivery.delivery_date && (
                              <span> • Entregado: {new Date(delivery.delivery_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">€{delivery.total_price}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>+{delivery.xp_earned} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {delivery.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">{getCategoryIcon(item.category)}</div>
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">Cantidad: {item.quantity}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">€{item.price}</div>
                            <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded mt-1">
                              💬 "{item.pet_reaction}"
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        {delivery.tracking_number && (
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>#{delivery.tracking_number}</span>
                          </div>
                        )}
                        {delivery.provider_name && (
                          <div className="flex items-center space-x-1">
                            <Stethoscope className="w-4 h-4" />
                            <span>{delivery.provider_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>+{delivery.pet_happiness_bonus} felicidad</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pet Happiness Timeline */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Trophy className="w-6 h-6 text-yellow-600" />
            🏆 Cronología de Felicidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveries.slice(0, 3).map((delivery) => (
              <div key={delivery.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                <div className="text-2xl">📦</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {new Date(delivery.delivery_date || delivery.order_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {delivery.items.map(item => item.name).join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Smile className="w-5 h-5 text-pink-500" />
                  <span className="font-medium text-pink-600">+{delivery.pet_happiness_bonus}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos sobre las entregas de {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cada entrega hace más feliz a {selectedPet.name} y te da puntos de experiencia</li>
                <li>• Los servicios completados aparecen aquí como misiones cumplidas</li>
                <li>• Mantén un registro de lo que le gusta más a tu mascota</li>
                <li>• ¡Las entregas regulares mantienen a tu mascota contenta y saludable!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deliveries;
