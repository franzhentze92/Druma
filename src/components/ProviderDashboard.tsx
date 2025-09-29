import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Users, 
  Calendar, 
  Star, 
  Settings,
  LogOut,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Plus,
  Edit,
  Trash2,
  Clock,
  Coins,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Tag,
  Scale,
  Ruler,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { useProvider, ProviderService, ProviderProduct } from '@/hooks/useProvider';
import ProviderServiceModal from './ProviderServiceModal';
import ProviderProductModal from './ProviderProductModal';
import ProviderOrders from './ProviderOrders';
import ProviderReviews from './ProviderReviews';
import ProfilePictureUpload from './ProfilePictureUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SERVICE_CATEGORIES = [
  { value: 'veterinaria', label: 'Veterinaria', icon: '🐕' },
  { value: 'grooming', label: 'Grooming', icon: '✂️' },
  { value: 'entrenamiento', label: 'Entrenamiento', icon: '🎾' },
  { value: 'alojamiento', label: 'Alojamiento', icon: '🏠' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'fisioterapia', label: 'Fisioterapia', icon: '💆' },
  { value: 'nutricion', label: 'Nutrición', icon: '🥩' },
  { value: 'otro', label: 'Otro', icon: '🔧' }
];

const PRODUCT_CATEGORIES = [
  { value: 'alimentos', label: 'Alimentos', icon: '🍖' },
  { value: 'juguetes', label: 'Juguetes', icon: '🎾' },
  { value: 'accesorios', label: 'Accesorios', icon: '🦮' },
  { value: 'higiene', label: 'Higiene', icon: '🧴' },
  { value: 'medicamentos', label: 'Medicamentos', icon: '💊' },
  { value: 'ropa', label: 'Ropa', icon: '👕' },
  { value: 'camas', label: 'Camas y Descanso', icon: '🛏️' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'otro', label: 'Otro', icon: '🔧' }
];

  const ProviderDashboard: React.FC = () => {
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProviderProduct | null>(null);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalProductsSold: 0,
    totalServicesBooked: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'appointment' | 'order' | 'stock' | 'review' | 'verification';
    title: string;
    message: string;
    time: Date;
    unread: boolean;
  }>>([]);

  const {
    profile,
    services,
    products,
    appointments,
    loading,
    error,
    saveProfile,
    uploadProfilePicture,
    addService,
    updateService,
    deleteService,
    addProduct,
    updateProduct,
    deleteProduct,
    updateAppointmentStatus,
    saveServiceAvailability,
    fetchServiceAvailability,
    saveServiceTimeSlots,
    fetchServiceTimeSlots
  } = useProvider();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    business_type: '',
    phone: '',
    address: '',
    description: '',
    profile_picture_url: '',
    city_id: 0,
    google_place_id: '',
    formatted_address: '',
    neighborhood: '',
    postal_code: '',
    has_delivery: false,
    has_pickup: false,
    delivery_fee: 0
  });

  // Profile picture state
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<File | null>(null);

  // Fetch revenue data
  const fetchRevenueData = async () => {
    if (!profile) return;

    try {
      // Get order items for this provider
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          orders (*)
        `)
        .eq('provider_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Calculate revenue metrics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let totalOrders = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let totalProductsSold = 0;
      let totalServicesBooked = 0;

      const orderMap = new Map<string, any>();

      orderItemsData?.forEach(item => {
        const order = item.orders;
        if (!order) return;

        if (!orderMap.has(order.id)) {
          orderMap.set(order.id, {
            ...order,
            items: []
          });
        }

        const orderData = orderMap.get(order.id);
        orderData.items.push(item);
      });

      orderMap.forEach(order => {
        totalOrders++;
        
        if (order.status === 'completed') {
          completedOrders++;
        } else if (order.status === 'pending') {
          pendingOrders++;
        }

        if (order.payment_status === 'completed') {
          const orderTotal = order.items.reduce((sum: number, item: any) => sum + item.total_price, 0);
          totalRevenue += orderTotal;

          // Count products and services sold
          order.items.forEach((item: any) => {
            if (item.item_type === 'product') {
              totalProductsSold += item.quantity;
            } else if (item.item_type === 'service') {
              totalServicesBooked += item.quantity;
            }
          });

          // Check if order is from current month
          const orderDate = new Date(order.created_at);
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            monthlyRevenue += orderTotal;
          }
        }
      });

      // Calculate average rating from profile
      const averageRating = profile?.rating || 0;
      const totalReviews = profile?.total_reviews || 0;

      setRevenueData({
        totalRevenue,
        monthlyRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalProductsSold,
        totalServicesBooked,
        averageRating,
        totalReviews
      });
    } catch (err) {
      console.error('Error fetching revenue data:', err);
    }
  };

  // Generate notifications based on real data
  const generateNotifications = () => {
    const newNotifications: Array<{
      id: string;
      type: 'appointment' | 'order' | 'stock' | 'review' | 'verification';
      title: string;
      message: string;
      time: Date;
      unread: boolean;
    }> = [];

    // Pending appointments notifications
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    if (pendingAppointments.length > 0) {
      newNotifications.push({
        id: 'pending-appointments',
        type: 'appointment',
        title: 'Citas Pendientes',
        message: `Tienes ${pendingAppointments.length} cita${pendingAppointments.length > 1 ? 's' : ''} pendiente${pendingAppointments.length > 1 ? 's' : ''} de confirmación`,
        time: new Date(),
        unread: true
      });
    }

    // Low stock notifications
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_alert);
    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'stock',
        title: 'Stock Bajo',
        message: `${lowStockProducts.length} producto${lowStockProducts.length > 1 ? 's' : ''} con stock bajo`,
        time: new Date(),
        unread: true
      });
    }

    // Verification status notification
    if (!profile?.is_verified) {
      newNotifications.push({
        id: 'verification-pending',
        type: 'verification',
        title: 'Verificación Pendiente',
        message: 'Completa la verificación de tu perfil para mejorar tu visibilidad',
        time: new Date(),
        unread: true
      });
    }

    // Inactive services notification
    const inactiveServices = services.filter(s => !s.is_active);
    if (inactiveServices.length > 0) {
      newNotifications.push({
        id: 'inactive-services',
        type: 'appointment',
        title: 'Servicios Inactivos',
        message: `${inactiveServices.length} servicio${inactiveServices.length > 1 ? 's' : ''} inactivo${inactiveServices.length > 1 ? 's' : ''}`,
        time: new Date(),
        unread: true
      });
    }

    setNotifications(newNotifications);
  };

  // Cities state for location selection
  const [cities, setCities] = useState<Array<{id: number, city_name: string, department: string}>>([]);

  // Fetch cities for location selection
  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('guatemala_cities')
        .select('id, city_name, department')
        .eq('is_active', true)
        .order('city_name');
      
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Fetch cities on component mount
  React.useEffect(() => {
    fetchCities();
  }, []);

  // Initialize profile form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        phone: profile.phone || '',
        address: profile.address || '',
        description: profile.description || '',
        profile_picture_url: profile.profile_picture_url || '',
        city_id: profile.city_id || 0,
        google_place_id: profile.google_place_id || '',
        formatted_address: profile.formatted_address || '',
        neighborhood: profile.neighborhood || '',
        postal_code: profile.postal_code || '',
        has_delivery: profile.has_delivery || false,
        has_pickup: profile.has_pickup || false,
        delivery_fee: profile.delivery_fee || 0
      });
      fetchRevenueData();
      generateNotifications();
    }
  }, [profile, appointments, products, services]);

  

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('user_role');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileSave = async () => {
    try {
      let profilePictureUrl = profileForm.profile_picture_url;

      // Upload new profile picture if selected
      if (selectedProfilePicture) {
        profilePictureUrl = await uploadProfilePicture(selectedProfilePicture);
      }

      // Validate that we have a profile picture
      if (!profilePictureUrl) {
        toast({
          title: "⚠️ Foto de Perfil Requerida",
          description: "La foto de perfil es obligatoria para continuar.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Validate that we have a city selected
      if (!profileForm.city_id) {
        toast({
          title: "⚠️ Ciudad Requerida",
          description: "Debes seleccionar una ciudad para continuar.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      await saveProfile({
        ...profileForm,
        profile_picture_url: profilePictureUrl
      });
      
      setIsEditing(false);
      setSelectedProfilePicture(null);
      toast({
        title: "✅ Perfil Actualizado",
        description: "Tu perfil de proveedor ha sido actualizado exitosamente.",
        variant: "default",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "❌ Error al Guardar",
        description: `No se pudo actualizar el perfil: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  const handleServiceSave = async (serviceData, availability = [], timeSlots = []) => {
    try {
      let savedService;
      if (editingService) {
        savedService = await updateService(editingService.id, serviceData);
        
        // Save availability and time slots for existing service
        if (availability.length > 0) {
          await saveServiceAvailability(editingService.id, availability);
        }
        if (timeSlots.length > 0) {
          await saveServiceTimeSlots(editingService.id, timeSlots);
        }
        
        toast({
          title: "✅ Servicio Actualizado",
          description: `"${serviceData.service_name}" ha sido actualizado exitosamente.`,
          variant: "default",
          duration: 4000,
        });
      } else {
        savedService = await addService(serviceData);
        
        // Save availability and time slots for new service
        if (availability.length > 0) {
          await saveServiceAvailability(savedService.id, availability);
        }
        if (timeSlots.length > 0) {
          await saveServiceTimeSlots(savedService.id, timeSlots);
        }
        
        toast({
          title: "🎉 Servicio Creado",
          description: `"${serviceData.service_name}" ha sido agregado exitosamente a tu catálogo.`,
          variant: "default",
          duration: 4000,
        });
      }

      setEditingService(null);
      setIsEditing(false);
      setIsServiceModalOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "❌ Error al Guardar",
        description: `No se pudo ${editingService ? 'actualizar' : 'crear'} el servicio: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  const handleServiceEdit = (service: ProviderService) => {
    console.log('handleServiceEdit called with service:', service);
    setEditingService(service);
    setIsEditing(true);
    setIsServiceModalOpen(true);
    toast({
      title: "✏️ Editando Servicio",
      description: `Editando "${service.service_name}"`,
      variant: "default",
      duration: 2000,
    });
  };

  const handleServiceDelete = async (serviceId) => {
    const serviceToDelete = services.find(s => s.id === serviceId);
    if (!serviceToDelete) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${serviceToDelete.service_name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteService(serviceId);
        toast({
          title: "🗑️ Servicio Eliminado",
          description: `"${serviceToDelete.service_name}" ha sido eliminado exitosamente.`,
          variant: "default",
          duration: 4000,
        });
      } catch (error) {
        console.error('Error deleting service:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast({
          title: "❌ Error al Eliminar",
          description: `No se pudo eliminar "${serviceToDelete.service_name}": ${errorMessage}`,
          variant: "destructive",
          duration: 6000,
        });
      }
    }
  };

  const handleAppointmentStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      
      const statusMessages = {
        'confirmed': '✅ Cita Confirmada',
        'cancelled': '❌ Cita Cancelada',
        'completed': '🎯 Cita Completada',
        'pending': '⏳ Cita Pendiente'
      };
      
      const statusDescriptions = {
        'confirmed': 'La cita ha sido confirmada exitosamente.',
        'cancelled': 'La cita ha sido cancelada.',
        'completed': 'La cita ha sido marcada como completada.',
        'pending': 'La cita está pendiente de confirmación.'
      };
      
      toast({
        title: statusMessages[newStatus] || 'Estado Actualizado',
        description: statusDescriptions[newStatus] || 'El estado de la cita ha sido actualizado.',
        variant: newStatus === 'cancelled' ? 'destructive' : 'default',
        duration: 4000,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "❌ Error al Actualizar",
        description: `No se pudo actualizar el estado de la cita: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

    // Product handlers
  const handleProductAdd = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
    toast({
      title: "➕ Nuevo Producto",
      description: "Creando un nuevo producto",
      variant: "default",
      duration: 2000,
    });
  };

  const handleProductEdit = (product: ProviderProduct) => {
    console.log('🔄 Opening Edit Product Modal for:', product.product_name);
    setEditingProduct(product);
    setIsProductModalOpen(true);
    toast({
      title: "✏️ Editando Producto",
      description: `Editando "${product.product_name}"`,
      variant: "default",
      duration: 2000,
    });
  };

  const handleProductDelete = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productToDelete.product_name}"? Esta acción no se puede deshacer.`)) {
      try {
        console.log('🗑️ Deleting product:', productId);
        await deleteProduct(productId);
        toast({
          title: "🗑️ Producto Eliminado",
          description: `"${productToDelete.product_name}" ha sido eliminado exitosamente.`,
          variant: "default",
          duration: 4000,
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast({
          title: "❌ Error al Eliminar",
          description: `No se pudo eliminar "${productToDelete.product_name}": ${errorMessage}`,
          variant: "destructive",
          duration: 6000,
        });
      }
    }
  };

  const handleProductSave = async (productData: Omit<ProviderProduct, 'id' | 'provider_id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('💾 Saving product data:', productData);
      if (editingProduct) {
        console.log('✏️ Updating existing product:', editingProduct.id);
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "✅ Producto Actualizado",
          description: "El producto ha sido actualizado exitosamente.",
        });
      } else {
        console.log('➕ Creating new product');
        await addProduct(productData);
        toast({
          title: "🎉 Producto Creado",
          description: "El producto ha sido creado exitosamente.",
        });
      }
      setEditingProduct(null);
      setIsProductModalOpen(false);
    } catch (error) {
      console.error('❌ Error saving product:', error);
      toast({
        title: "❌ Error al Guardar",
        description: "No se pudo guardar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso denegado</h2>
        <p className="text-gray-500">Debes iniciar sesión para acceder al dashboard del proveedor.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 p-6">

      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {profile?.profile_picture_url && (
              <Avatar className="w-16 h-16 border-2 border-emerald-200">
                <AvatarImage 
                  src={profile.profile_picture_url} 
                  alt="Profile picture"
                  className="object-cover"
                />
                <AvatarFallback className="text-lg">
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard del Proveedor</h1>
              <p className="text-gray-600">
                {profile ? `Bienvenido, ${profile.business_name}` : 'Configura tu perfil para comenzar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {notifications.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => {
                    // Toggle notifications visibility
                    const notificationElement = document.getElementById('notifications-dropdown');
                    if (notificationElement) {
                      notificationElement.classList.toggle('hidden');
                    }
                  }}
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                <div 
                  id="notifications-dropdown"
                  className="hidden absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          // Mark as read
                          setNotifications(prev => 
                            prev.map(n => 
                              n.id === notification.id ? { ...n, unread: false } : n
                            )
                          );
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'appointment' ? 'bg-blue-100' :
                            notification.type === 'stock' ? 'bg-orange-100' :
                            notification.type === 'verification' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {notification.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                            {notification.type === 'stock' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                            {notification.type === 'verification' && <CheckCircle className="w-4 h-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                            <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {notification.time.toLocaleTimeString('es-GT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Badge variant="secondary" className="text-sm">
              <Building2 className="w-4 h-4 mr-2" />
              Proveedor
            </Badge>
            {profile && (
              <Badge variant={profile.is_verified ? "default" : "outline"} className="text-sm">
                {profile.is_verified ? "Verificado" : "Pendiente de verificación"}
              </Badge>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Servicios
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Productos
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Órdenes
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Citas
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
          >
            Reseñas
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
              {!profile ? (
            <Card>
              <CardContent className="text-center py-8">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Configura tu perfil</h3>
                  <p className="text-gray-500 mb-4">
                    Para comenzar a usar el dashboard, necesitas configurar tu perfil de proveedor.
                  </p>
                  <Button onClick={() => setActiveTab('profile')}>
                    Configurar Perfil
                  </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
                        <p className="text-2xl font-bold text-emerald-600">{revenueData.totalProductsSold}</p>
                      </div>
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Package className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {products.filter(p => p.is_active).length} productos activos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Servicios Reservados</p>
                        <p className="text-2xl font-bold text-blue-600">{revenueData.totalServicesBooked}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {appointments.filter(a => a.status === 'completed').length} completados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-green-600">Q{revenueData.totalRevenue.toFixed(0)}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Coins className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {revenueData.completedOrders} órdenes completadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Calificación</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {revenueData.averageRating > 0 ? `${revenueData.averageRating.toFixed(1)}/5` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {revenueData.totalReviews} reseñas reales
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Business Overview and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Resumen del Negocio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-emerald-800 mb-2">Servicios</h4>
                          <div className="space-y-1 text-sm text-emerald-700">
                            <p>• {revenueData.totalServicesBooked} servicios reservados</p>
                            <p>• {services.filter(s => s.is_active).length} servicios activos</p>
                            <p>• Promedio: Q{services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : 0}</p>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Productos</h4>
                          <div className="space-y-1 text-sm text-blue-700">
                            <p>• {revenueData.totalProductsSold} productos vendidos</p>
                            <p>• {products.filter(p => p.is_active).length} productos activos</p>
                            <p>• {products.filter(p => p.stock_quantity <= p.min_stock_alert).length} con stock bajo</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Información del Negocio</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                          <div>
                            <p><strong>Tipo:</strong> {profile.business_type || 'No especificado'}</p>
                            <p><strong>Ciudad:</strong> {profile.city_id ? cities.find(c => c.id === profile.city_id)?.city_name || 'No especificada' : 'No especificada'}</p>
                          </div>
                          <div>
                            <p><strong>Verificación:</strong> 
                              <Badge variant={profile.is_verified ? "default" : "secondary"} className="ml-2">
                                {profile.is_verified ? "Verificado" : "Pendiente"}
                              </Badge>
                            </p>
                            <p><strong>Entrega:</strong> {profile.has_delivery ? "Disponible" : "No disponible"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => {
                        setIsServiceModalOpen(true);
                        setEditingService(null);
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Servicio
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsProductModalOpen(true);
                        setEditingProduct(null);
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('appointments')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Gestionar Citas
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('profile')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('reviews')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Ver Reseñas
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Recent Appointments */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Citas Recientes</h4>
                      {appointments.length > 0 ? (
                        <div className="space-y-2">
                          {appointments.slice(0, 3).map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{appointment.provider_services?.service_name || 'Servicio'}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(appointment.appointment_date).toLocaleDateString()} - 
                                  {appointment.client_email}
                                </p>
                              </div>
                              <Badge 
                                variant={
                                  appointment.status === 'confirmed' ? 'default' :
                                  appointment.status === 'pending' ? 'secondary' :
                                  appointment.status === 'completed' ? 'outline' : 'destructive'
                                }
                              >
                                {appointment.status === 'pending' ? 'Pendiente' :
                                 appointment.status === 'confirmed' ? 'Confirmada' :
                                 appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                              </Badge>
                            </div>
                          ))}
                </div>
              ) : (
                        <p className="text-gray-500 text-sm">No hay citas recientes</p>
                      )}
                    </div>

                    {/* Low Stock Alert */}
                    {products.filter(p => p.stock_quantity <= p.min_stock_alert).length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <h4 className="font-semibold text-orange-800">Alerta de Stock Bajo</h4>
                        </div>
                        <div className="space-y-1">
                          {products.filter(p => p.stock_quantity <= p.min_stock_alert).slice(0, 3).map((product) => (
                            <p key={product.id} className="text-sm text-orange-700">
                              • {product.product_name} - Solo {product.stock_quantity} unidades restantes
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Análisis de Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Ingresos Totales</p>
                          <p className="text-2xl font-bold text-green-700">Q{revenueData.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                          <Coins className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {revenueData.completedOrders} órdenes completadas
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Este Mes</p>
                          <p className="text-2xl font-bold text-blue-700">Q{revenueData.monthlyRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Total Órdenes</p>
                          <p className="text-2xl font-bold text-purple-700">{revenueData.totalOrders}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        {revenueData.pendingOrders} pendientes
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Promedio por Orden</p>
                          <p className="text-2xl font-bold text-orange-700">
                            Q{revenueData.totalOrders > 0 ? (revenueData.totalRevenue / revenueData.totalOrders).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Scale className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Valor promedio
                      </p>
                    </div>
                  </div>

                  {/* Revenue Chart Placeholder */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Tendencia de Ingresos</h4>
                    <div className="h-32 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Coins className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Gráfico de ingresos próximamente</p>
                        <p className="text-xs">Se mostrará la evolución mensual</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Indicadores de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Conversion Rate */}
                  <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-emerald-800">Tasa de Conversión</h4>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {appointments.length > 0 ? 
                          ((appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length / appointments.length) * 100).toFixed(1) 
                          : 0}%
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Citas confirmadas/completadas
                      </p>
                    </div>

                    {/* Customer Satisfaction */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-800">Satisfacción del Cliente</h4>
                        <Star className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {profile.rating > 0 ? `${profile.rating.toFixed(1)}/5` : 'N/A'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Basado en {profile.total_reviews} reseñas
                      </p>
                    </div>

                    {/* Service Utilization */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-800">Utilización de Servicios</h4>
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        {services.length > 0 ? 
                          ((services.filter(s => s.is_active).length / services.length) * 100).toFixed(0) 
                          : 0}%
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Servicios activos vs total
                      </p>
                    </div>

                    {/* Response Time */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-orange-800">Tiempo de Respuesta</h4>
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        {appointments.filter(a => a.status === 'pending').length > 0 ? 'Pendiente' : 'Al día'}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {appointments.filter(a => a.status === 'pending').length} citas pendientes
                      </p>
                    </div>

                    {/* Inventory Health */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-800">Salud del Inventario</h4>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {products.length > 0 ? 
                          ((products.filter(p => p.stock_quantity > p.min_stock_alert).length / products.length) * 100).toFixed(0) 
                          : 100}%
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Productos con stock adecuado
                      </p>
                    </div>

                    {/* Business Growth */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-800">Crecimiento del Negocio</h4>
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {services.length + products.length}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Total de servicios y productos
                      </p>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Resumen de Rendimiento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-700">
                          <strong>Estado General:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            profile.is_verified && 
                            appointments.filter(a => a.status === 'pending').length === 0 &&
                            products.filter(p => p.stock_quantity <= p.min_stock_alert).length === 0
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {profile.is_verified && 
                             appointments.filter(a => a.status === 'pending').length === 0 &&
                             products.filter(p => p.stock_quantity <= p.min_stock_alert).length === 0
                              ? 'Excelente' 
                              : 'Necesita atención'}
                          </span>
                        </p>
                        <p className="text-gray-700 mt-1">
                          <strong>Verificación:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            profile.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.is_verified ? 'Verificado' : 'Pendiente'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <strong>Acciones Requeridas:</strong>
                        </p>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          {!profile.is_verified && <li>• Completar verificación del perfil</li>}
                          {appointments.filter(a => a.status === 'pending').length > 0 && 
                            <li>• Responder a {appointments.filter(a => a.status === 'pending').length} citas pendientes</li>}
                          {products.filter(p => p.stock_quantity <= p.min_stock_alert).length > 0 && 
                            <li>• Reabastecer {products.filter(p => p.stock_quantity <= p.min_stock_alert).length} productos</li>}
                          {services.filter(s => !s.is_active).length > 0 && 
                            <li>• Activar {services.filter(s => !s.is_active).length} servicios inactivos</li>}
                          {services.filter(s => !s.is_active).length === 0 && 
                           appointments.filter(a => a.status === 'pending').length === 0 &&
                           products.filter(p => p.stock_quantity <= p.min_stock_alert).length === 0 &&
                           profile.is_verified && 
                           <li>• ¡Todo al día! 🎉</li>}
                    </ul>
                  </div>
                </div>
                  </div>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil del Proveedor
                </CardTitle>
                {!isEditing && (
                  <Button 
                    onClick={() => {
                      setIsEditing(true);
                      toast({
                        title: "✏️ Editando Perfil",
                        description: "Modifica la información de tu negocio",
                        variant: "default",
                        duration: 2000,
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-800 text-sm font-medium">
                      Modo de edición activo - Los campos están habilitados para editar
                    </p>
                  </div>
                </div>
              )}
              {/* Profile Picture Upload */}
              <ProfilePictureUpload
                currentImageUrl={profileForm.profile_picture_url}
                onImageChange={setSelectedProfilePicture}
                onImageRemove={() => setSelectedProfilePicture(null)}
                disabled={!isEditing}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider-name">Nombre del Negocio *</Label>
                    <Input 
                      id="provider-name" 
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                      placeholder="Nombre de tu negocio"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-phone">Teléfono</Label>
                    <Input 
                      id="provider-phone" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-email">Email</Label>
                    <Input 
                      id="provider-email" 
                      value={user.email || ''} 
                      readOnly 
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider-address">Dirección</Label>
                    <Input 
                      id="provider-address" 
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección de tu negocio"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-city">Ciudad *</Label>
                    <select 
                      id="provider-city"
                      value={profileForm.city_id}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, city_id: parseInt(e.target.value) || 0 }))}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value={0}>Seleccionar ciudad</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.city_name} - {city.department}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-1">
                      💡 Para ubicación más precisa, próximamente integraremos Google Places
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Esta información mejorará la experiencia de tus clientes en el marketplace
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="provider-neighborhood">Colonia/Barrio</Label>
                    <Input 
                      id="provider-neighborhood" 
                      value={profileForm.neighborhood}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Colonia o barrio"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-postal-code">Código Postal</Label>
                    <Input 
                      id="provider-postal-code" 
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="Código postal"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-base font-medium">Opciones de Entrega</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has-pickup"
                            checked={profileForm.has_pickup}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, has_pickup: e.target.checked }))}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label htmlFor="has-pickup" className="text-sm font-normal">
                            Recogida en tienda
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has-delivery"
                            checked={profileForm.has_delivery}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, has_delivery: e.target.checked }))}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label htmlFor="has-delivery" className="text-sm font-normal">
                            Entrega a domicilio
                          </Label>
                        </div>
                      </div>
                    </div>
                    {profileForm.has_delivery && (
                      <div>
                        <Label htmlFor="delivery-fee">Costo de Entrega (GTQ)</Label>
                        <Input 
                          id="delivery-fee" 
                          type="number"
                          min="0"
                          step="0.01"
                          value={profileForm.delivery_fee}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          disabled={!isEditing}
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Deja en 0 si la entrega es gratuita
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Estas opciones se mostrarán a tus clientes en el marketplace para ayudarlos a elegir
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="provider-type">Tipo de Negocio *</Label>
                    <select 
                      id="provider-type"
                      value={profileForm.business_type}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, business_type: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="veterinario">Clínica Veterinaria</option>
                      <option value="tienda">Tienda de Mascotas</option>
                      <option value="peluqueria">Peluquería Canina</option>
                      <option value="entrenamiento">Entrenamiento</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="provider-description">Descripción</Label>
                    <Textarea 
                      id="provider-description" 
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe tu negocio y servicios..."
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {!isEditing ? (
                  <Button 
                    onClick={() => {
                      setIsEditing(true);
                      toast({
                        title: "✏️ Editando Perfil",
                        description: "Modifica la información de tu negocio",
                        variant: "default",
                        duration: 2000,
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setSelectedProfilePicture(null);
                      // Reset form to original values
                      if (profile) {
                        setProfileForm({
                          business_name: profile.business_name || '',
                          business_type: profile.business_type || '',
                          phone: profile.phone || '',
                          address: profile.address || '',
                          description: profile.description || '',
                          profile_picture_url: profile.profile_picture_url || '',
                          city_id: profile.city_id || 0,
                          google_place_id: profile.google_place_id || '',
                          formatted_address: profile.formatted_address || '',
                          neighborhood: profile.neighborhood || '',
                          postal_code: profile.postal_code || '',
                          has_delivery: profile.has_delivery || false,
                          has_pickup: profile.has_pickup || false,
                          delivery_fee: profile.delivery_fee || 0
                        });
                      }
                      toast({
                        title: "❌ Edición Cancelada",
                        description: "Los cambios no han sido guardados",
                        variant: "default",
                        duration: 3000,
                      });
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleProfileSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Mis Servicios
                </CardTitle>
                <Button onClick={() => {
                  setIsServiceModalOpen(true);
                  toast({
                    title: "➕ Nuevo Servicio",
                    description: "Completa la información para crear un nuevo servicio",
                    variant: "default",
                    duration: 3000,
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Servicio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay servicios configurados aún</p>
                  <p className="text-sm">Agrega tu primer servicio para comenzar</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Servicio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Categoría</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Precio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Duración</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Reservas</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          {/* Service Name & Description */}
                          <td className="py-4 px-4">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">{service.service_name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                {service.description}
                              </p>
                              {service.detailed_description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {service.detailed_description}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="text-xs">
                              {service.service_category ? 
                                SERVICE_CATEGORIES.find(c => c.value === service.service_category)?.label || service.service_category
                                : 'Sin categoría'
                              }
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-emerald-600" />
                              <span className="font-medium text-gray-900">
                                {service.currency === 'GTQ' ? 'Q.' : '$'}{service.price}
                              </span>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </td>

                          {/* Booking Info */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>Max: {service.max_advance_booking_days || 30} días</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <AlertCircle className="w-3 h-3" />
                                <span>Min: {service.min_advance_booking_hours || 2}h</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleServiceEdit(service)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleServiceDelete(service.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Mis Productos
                </CardTitle>
                                <Button onClick={handleProductAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay productos configurados aún</p>
                  <p className="text-sm">Agrega tu primer producto para comenzar a vender</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Imagen</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Producto</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Categoría</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Precio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          {/* Product Image */}
                          <td className="py-4 px-4">
                            {product.product_image_url ? (
                              <div className="w-16 h-16 rounded-md overflow-hidden border">
                                <img 
                                  src={product.product_image_url} 
                                  alt={product.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>

                          {/* Product Name & Description */}
                          <td className="py-4 px-4">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">{product.product_name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                {product.description}
                              </p>
                              {product.brand && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Marca: {product.brand}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="text-xs">
                              {product.product_category ? 
                                PRODUCT_CATEGORIES.find(c => c.value === product.product_category)?.label || product.product_category
                                : 'Sin categoría'
                              }
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-emerald-600" />
                              <span className="font-medium text-gray-900">
                                {product.currency === 'GTQ' ? 'Q.' : '$'}{product.price}
                              </span>
                            </div>
                            {product.weight_kg && (
                              <p className="text-xs text-gray-500 mt-1">
                                {product.weight_kg} kg
                              </p>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Package className={`w-4 h-4 ${
                                product.stock_quantity === 0 
                                  ? 'text-red-600' 
                                  : product.stock_quantity <= product.min_stock_alert
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`} />
                              <span className={`text-sm font-medium ${
                                product.stock_quantity === 0 
                                  ? 'text-red-600' 
                                  : product.stock_quantity <= product.min_stock_alert
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}>
                                {product.stock_quantity}
                              </span>
                            </div>
                            {product.stock_quantity <= product.min_stock_alert && product.stock_quantity > 0 && (
                              <p className="text-xs text-yellow-600 mt-1">Stock bajo</p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProductEdit(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProductDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <ProviderOrders />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mis Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay citas programadas</p>
                  <p className="text-sm">Las citas aparecerán aquí cuando los clientes las reserven</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {appointment.provider_services?.service_name || 'Servicio'}
                            </h3>
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">
                                {appointment.status === 'confirmed' && 'Confirmada'}
                                {appointment.status === 'pending' && 'Pendiente'}
                                {appointment.status === 'cancelled' && 'Cancelada'}
                                {appointment.status === 'completed' && 'Completada'}
                              </span>
                            </Badge>
                          </div>
                                                     <p className="text-gray-600 text-sm mb-2">
                             Cliente: {appointment.client_email || 'N/A'}
                           </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Fecha: {new Date(appointment.appointment_date).toLocaleDateString()}
                            </span>
                            <span>
                              Hora: {new Date(appointment.appointment_date).toLocaleTimeString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Coins className="w-4 h-4" />
                              {appointment.provider_services?.currency === 'GTQ' ? 'Q.' : '$'}{appointment.provider_services?.price || 0}
                            </span>
                          </div>
                          {appointment.notes && (
                            <p className="text-gray-600 text-sm mt-2">
                              Notas: {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAppointmentStatusUpdate(appointment.id, 'confirmed')}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAppointmentStatusUpdate(appointment.id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAppointmentStatusUpdate(appointment.id, 'completed')}
                            >
                              Marcar Completada
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <ProviderReviews />
        </TabsContent>
      </Tabs>

      {/* Service Modal */}
      <ProviderServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
          setIsEditing(false);
        }}
        onSave={handleServiceSave}
        service={editingService}
        isEditing={!!editingService}
        onSaveAvailability={async (serviceId, availability) => {
          try {
            await saveServiceAvailability(serviceId, availability);
          } catch (error) {
            console.error('Error saving availability:', error);
            throw error;
          }
        }}
        onSaveTimeSlots={async (serviceId, timeSlots) => {
          try {
            await saveServiceTimeSlots(serviceId, timeSlots);
          } catch (error) {
            console.error('Error saving time slots:', error);
            throw error;
          }
        }}
        onFetchAvailability={fetchServiceAvailability}
        onFetchTimeSlots={fetchServiceTimeSlots}
      />

      {/* Product Modal */}
      <ProviderProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          console.log('🔒 Modal onClose called');
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleProductSave}
        product={editingProduct}
        isEditing={!!editingProduct}
      />
      

      

    </div>
  );
};

export default ProviderDashboard;
