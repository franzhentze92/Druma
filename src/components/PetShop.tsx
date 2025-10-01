import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Plus, 
  Minus,
  Search,
  Filter,
  Truck,
  PawPrint,
  Utensils,
  Gamepad2,
  Shirt,
  Stethoscope,
  Sparkles,
  Gift,
  ShoppingCart,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface PetProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: 'food' | 'toys' | 'accessories' | 'health' | 'services';
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  pet_reaction: string;
  xp_reward: number;
}

interface PetService {
  id: string;
  name: string;
  description: string;
  price: number;
  provider_name: string;
  provider_rating: number;
  duration: string;
  category: 'vet' | 'grooming' | 'training' | 'daycare';
  availability: string;
  mission_description: string;
  xp_reward: number;
}

const PetShop: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [products, setProducts] = useState<PetProduct[]>([]);
  const [services, setServices] = useState<PetService[]>([]);
  const [suppliesBag, setSuppliesBag] = useState<{item: PetProduct | PetService, quantity: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user) {
      loadPets();
      loadProducts();
      loadServices();
    }
  }, [user]);

  useEffect(() => {
    if (pets && pets.length > 0) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockProducts: PetProduct[] = [
        {
          id: '1',
          name: 'Croquetas Premium',
          description: 'Alimento balanceado para perros adultos',
          price: 25.99,
          image_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=dog-food',
          category: 'food',
          rating: 4.8,
          reviews_count: 156,
          in_stock: true,
          pet_reaction: '¡Yum! Estas croquetas me encantan 🐕',
          xp_reward: 5
        },
        {
          id: '2',
          name: 'Pelota Interactiva',
          description: 'Juguete que se mueve solo para mantener entretenido a tu mascota',
          price: 15.50,
          image_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=toy',
          category: 'toys',
          rating: 4.6,
          reviews_count: 89,
          in_stock: true,
          pet_reaction: '¡Qué divertido! ¡Quiero jugar todo el día! 🎾',
          xp_reward: 8
        },
        {
          id: '3',
          name: 'Collar LED',
          description: 'Collar luminoso para paseos nocturnos seguros',
          price: 12.99,
          image_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=collar',
          category: 'accessories',
          rating: 4.4,
          reviews_count: 67,
          in_stock: true,
          pet_reaction: '¡Me veo súper elegante! ✨',
          xp_reward: 3
        },
        {
          id: '4',
          name: 'Vitaminas Complejas',
          description: 'Suplemento vitamínico para mascotas',
          price: 18.75,
          image_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=vitamins',
          category: 'health',
          rating: 4.7,
          reviews_count: 123,
          in_stock: true,
          pet_reaction: '¡Me siento más fuerte y saludable! 💪',
          xp_reward: 10
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      // Mock data for demonstration
      const mockServices: PetService[] = [
        {
          id: '1',
          name: 'Consulta Veterinaria',
          description: 'Revisión médica completa y vacunación',
          price: 45.00,
          provider_name: 'Dr. María González',
          provider_rating: 4.9,
          duration: '45 min',
          category: 'vet',
          availability: 'Lunes a Viernes 9:00-18:00',
          mission_description: 'Lleva a tu mascota al doctor para un checkup completo 🩺',
          xp_reward: 15
        },
        {
          id: '2',
          name: 'Spa Day Completo',
          description: 'Baño, corte, manicura y masaje relajante',
          price: 35.00,
          provider_name: 'Pet Spa Elegance',
          provider_rating: 4.8,
          duration: '2 horas',
          category: 'grooming',
          availability: 'Martes a Sábado 10:00-17:00',
          mission_description: 'Dale a tu mascota un día de spa y relajación 🛁',
          xp_reward: 12
        },
        {
          id: '3',
          name: 'Entrenamiento Básico',
          description: 'Clases de obediencia y comportamiento',
          price: 60.00,
          provider_name: 'Dog Training Pro',
          provider_rating: 4.7,
          duration: '1 hora',
          category: 'training',
          availability: 'Fines de semana 10:00-16:00',
          mission_description: 'Ayuda a tu mascota a aprender nuevos trucos 🎓',
          xp_reward: 20
        },
        {
          id: '4',
          name: 'Guardería Diaria',
          description: 'Cuidado y socialización durante el día',
          price: 25.00,
          provider_name: 'Happy Paws Daycare',
          provider_rating: 4.6,
          duration: '8 horas',
          category: 'daycare',
          availability: 'Lunes a Viernes 7:00-19:00',
          mission_description: 'Deja que tu mascota juegue con otros amigos 🏡',
          xp_reward: 18
        }
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const getPetRecommendation = () => {
    if (!selectedPet) return '';
    
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) {
      return `${selectedPet.name} tiene hambre 🍖 — ¿quieres comprar comida?`;
    } else if (hour >= 18 && hour <= 20) {
      return `¡${selectedPet.name} necesita jugar! 🎾 — ¿nuevos juguetes?`;
    } else {
      return `${selectedPet.name} está aburrido 🐾 — ¿qué le compras hoy?`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍖';
      case 'toys': return '🎾';
      case 'accessories': return '🐾';
      case 'health': return '🩺';
      case 'services': return '🛁';
      case 'vet': return '🏥';
      case 'grooming': return '🛁';
      case 'training': return '🎓';
      case 'daycare': return '🏡';
      default: return '🛍️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'from-orange-500 to-red-500';
      case 'toys': return 'from-green-500 to-blue-500';
      case 'accessories': return 'from-purple-500 to-pink-500';
      case 'health': return 'from-blue-500 to-cyan-500';
      case 'services': return 'from-yellow-500 to-orange-500';
      case 'vet': return 'from-red-500 to-pink-500';
      case 'grooming': return 'from-cyan-500 to-blue-500';
      case 'training': return 'from-green-500 to-emerald-500';
      case 'daycare': return 'from-yellow-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const addToSuppliesBag = (item: PetProduct | PetService) => {
    const existingItem = suppliesBag.find(bagItem => bagItem.item.id === item.id);
    if (existingItem) {
      setSuppliesBag(prev => prev.map(bagItem => 
        bagItem.item.id === item.id 
          ? { ...bagItem, quantity: bagItem.quantity + 1 }
          : bagItem
      ));
    } else {
      setSuppliesBag(prev => [...prev, { item, quantity: 1 }]);
    }
    
    toast({
      title: "¡Agregado a la bolsa! 🛍️",
      description: `${item.name} agregado a los suministros de ${selectedPet?.name}`,
    });
  };

  const removeFromSuppliesBag = (itemId: string) => {
    setSuppliesBag(prev => prev.filter(bagItem => bagItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromSuppliesBag(itemId);
      return;
    }
    
    setSuppliesBag(prev => prev.map(bagItem => 
      bagItem.item.id === itemId 
        ? { ...bagItem, quantity }
        : bagItem
    ));
  };

  const getTotalPrice = () => {
    return suppliesBag.reduce((total, bagItem) => total + (bagItem.item.price * bagItem.quantity), 0);
  };

  const getTotalXP = () => {
    return suppliesBag.reduce((total, bagItem) => total + (bagItem.item.xp_reward * bagItem.quantity), 0);
  };

  const handleCheckout = () => {
    if (suppliesBag.length === 0) {
      toast({
        title: "Bolsa vacía",
        description: "Agrega algunos productos antes de continuar",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "¡Pedido realizado! 🎉",
      description: `Los suministros para ${selectedPet?.name} están en camino. +${getTotalXP()} XP ganado!`,
    });

    // Clear supplies bag
    setSuppliesBag([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!selectedPet) {
    return (
      <div className="p-6 text-center pb-20">
        <div className="text-6xl mb-4">🛍️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para comenzar a comprarle suministros
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
      {/* Pet Shop Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                    {selectedPet.species === 'Dog' ? '🐕' : selectedPet.species === 'Cat' ? '🐱' : '🐾'}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🛍️</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tienda de {selectedPet.name}</h2>
                <p className="text-gray-600">{getPetRecommendation()}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">€{getTotalPrice().toFixed(2)}</div>
              <div className="text-sm text-gray-600">Bolsa de Suministros</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar productos y servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="food">🍖 Comida</option>
              <option value="toys">🎾 Juguetes</option>
              <option value="accessories">🐾 Accesorios</option>
              <option value="health">🩺 Salud</option>
              <option value="vet">🏥 Veterinario</option>
              <option value="grooming">🛁 Aseo</option>
              <option value="training">🎓 Entrenamiento</option>
              <option value="daycare">🏡 Guardería</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shop Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white p-1 shadow-lg rounded-xl">
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Suministros</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Servicios</span>
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛍️</div>
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getCategoryIcon(product.category)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <Badge className={
                            product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }>
                            {product.in_stock ? 'Disponible' : 'Agotado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({product.reviews_count} reseñas)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">€{product.price}</div>
                          <Button 
                            size="sm"
                            onClick={() => addToSuppliesBag(product)}
                            disabled={!product.in_stock}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          💬 "{product.pet_reaction}"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛁</div>
              <p className="text-gray-600">No se encontraron servicios</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-r ${getCategoryColor(service.category)}`}>
                        <span className="text-2xl text-white">{getCategoryIcon(service.category)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900">{service.name}</h3>
                          <Badge className="bg-blue-100 text-blue-800">Misión</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{service.provider_name}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{service.provider_rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span>⏱️ {service.duration}</span>
                            <span>📅 {service.availability}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-purple-600">€{service.price}</div>
                          <Button 
                            size="sm"
                            onClick={() => addToSuppliesBag(service)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Reservar
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                          🎯 {service.mission_description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Supplies Bag Sidebar */}
      {suppliesBag.length > 0 && (
        <Card className="fixed bottom-20 right-4 w-80 bg-white shadow-2xl border-0 z-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              🛍️ Bolsa de Suministros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {suppliesBag.map((bagItem) => (
              <div key={bagItem.item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{bagItem.item.name}</div>
                  <div className="text-xs text-gray-500">€{bagItem.item.price} cada uno</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(bagItem.item.id, bagItem.quantity - 1)}
                    className="w-6 h-6 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{bagItem.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(bagItem.item.id, bagItem.quantity + 1)}
                    className="w-6 h-6 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-0 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-green-600">€{getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">XP Ganado:</span>
              <span className="text-sm font-bold text-yellow-600">+{getTotalXP()}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Truck className="w-4 h-4 mr-2" />
              Confirmar Pedido
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/deliveries'}
              className="w-full mt-2"
            >
              <Package className="w-4 h-4 mr-2" />
              Ver Entregas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pet Shop Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para la tienda de {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cada compra hace más feliz a {selectedPet.name} y te da XP</li>
                <li>• Los servicios son misiones que completas para cuidar a tu mascota</li>
                <li>• Las reseñas te ayudan a elegir los mejores productos y proveedores</li>
                <li>• ¡Mantén los suministros al día para que tu mascota esté siempre contenta!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetShop;
