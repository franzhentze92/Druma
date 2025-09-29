import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Building2, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface ProviderService {
  id: string;
  service_name: string;
  service_category: string;
  description: string;
  detailed_description?: string;
  price: number;
  currency: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  provider_id: string;
  providers: {
    user_id: string;
    business_name: string;
    business_type: string;
    address: string;
    phone: string;
    profile_picture_url?: string;
    latitude?: number;
    longitude?: number;
    city_id?: number;
    has_delivery?: boolean;
    has_pickup?: boolean;
    delivery_fee?: number;
    guatemala_cities: {
      city_name: string;
    };
  };
}

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ProviderService | null;
  onBookingSuccess: () => void;
}

interface TimeSlot {
  id: string;
  service_id: string;
  day_of_week: number;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  created_at: string;
}

interface Availability {
  id: string;
  service_id: string;
  day_of_week: number;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  created_at: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    notes: ''
  });

  const [quantity, setQuantity] = useState(1);

  // Fetch user profile information on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping profile fetch');
        return;
      }

      console.log('Fetching user profile for:', user.id, user.email);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();

        if (error) {
          console.log('No profile found, using auth user data');
          // If no profile exists, use auth user data directly
          const newInfo = {
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            phone: '',
            email: user.email || ''
          };
          console.log('Setting client info from auth user:', newInfo);
          setClientInfo(prev => ({ ...prev, ...newInfo }));
        } else {
          const newInfo = {
            name: profile.full_name || '',
            phone: profile.phone || '',
            email: user.email || ''
          };
          console.log('Setting client info from profile:', newInfo);
          setClientInfo(prev => ({ ...prev, ...newInfo }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback: use basic user info
        const fallbackInfo = {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          phone: '',
          email: user.email || ''
        };
        console.log('Using fallback client info:', fallbackInfo);
        setClientInfo(prev => ({ ...prev, ...fallbackInfo }));
      }
    };

    fetchUserProfile();
  }, [user]);

  // Generate next 30 days for date selection
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Fetch available time slots for selected date
  useEffect(() => {
    if (service && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [service, selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    if (!service || !selectedDate) return;

    try {
      setLoading(true);
      
      // Get the day of week for selected date
      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay();

      // First check if the time slots table exists
      console.log('Fetching time slots for service:', service.id, 'day:', dayOfWeek);
      
      // First, let's test if we can access the table at all
      const { data: allSlots, error: testError } = await supabase
        .from('provider_service_time_slots')
        .select('*')
        .limit(5);
      
      console.log('Test query result:', { allSlots, testError });
      
      const { data: timeSlots, error } = await supabase
        .from('provider_service_time_slots')
        .select('*')
        .eq('service_id', service.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .order('slot_start_time');
      
      console.log('Time slots query result:', { timeSlots, error });

      if (error) {
        // If table doesn't exist, create default time slots
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('Time slots table not found, creating default slots');
          const defaultSlots: TimeSlot[] = [
            { id: '1', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '09:00', slot_end_time: '10:00', is_available: true, created_at: new Date().toISOString() },
            { id: '2', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '10:00', slot_end_time: '11:00', is_available: true, created_at: new Date().toISOString() },
            { id: '3', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '11:00', slot_end_time: '12:00', is_available: true, created_at: new Date().toISOString() },
            { id: '4', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '14:00', slot_end_time: '15:00', is_available: true, created_at: new Date().toISOString() },
            { id: '5', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '15:00', slot_end_time: '16:00', is_available: true, created_at: new Date().toISOString() },
            { id: '6', service_id: service.id, day_of_week: dayOfWeek, slot_start_time: '16:00', slot_end_time: '17:00', is_available: true, created_at: new Date().toISOString() }
          ];
          setAvailableTimeSlots(defaultSlots);
          return;
        }
        throw error;
      }

      // Check for existing bookings on this date
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('service_appointments')
        .select('time_slot_id')
        .eq('service_id', service.id)
        .eq('appointment_date', selectedDate)
        .in('status', ['confirmed', 'pending']);

      if (bookingsError) {
        console.log('Appointments table not found, showing all slots as available');
        setAvailableTimeSlots(timeSlots || []);
        return;
      }

      const bookedSlotIds = existingBookings?.map(b => b.time_slot_id) || [];
      
      // Filter out booked time slots
      const availableSlots = timeSlots?.filter(slot => !bookedSlotIds.includes(slot.id)) || [];
      
      setAvailableTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!service || !selectedDate || !selectedTimeSlot || !user) {
      toast({
        title: "❌ Error",
        description: "Por favor selecciona una fecha y horario",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Check if we have the required user information
    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "❌ Error",
        description: "No se pudo obtener tu información de perfil. Por favor actualiza tu perfil primero.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setBookingLoading(true);

      // First, get the provider's user_id from the providers table
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', service.provider_id)
        .single();

      if (providerError) {
        console.error('Error fetching provider user_id:', providerError);
        throw providerError;
      }

      console.log('Provider user_id:', providerData.user_id);

      // Create service booking item for cart
      const serviceBookingItem = {
        id: `service-${service.id}-${Date.now()}`,
        type: 'service' as const,
        name: service.service_name,
        price: service.price,
        currency: service.currency,
        provider_id: service.provider_id,
        provider_name: service.providers.business_name,
        description: service.description,
        // Service-specific fields (we'll store these in a custom way)
        service_data: {
          service_id: service.id,
          appointment_date: selectedDate,
          time_slot_id: selectedTimeSlot,
          client_name: clientInfo.name,
          client_phone: clientInfo.phone,
          client_email: clientInfo.email,
          notes: clientInfo.notes
        }
      };

      // Add to cart with quantity
      for (let i = 0; i < quantity; i++) {
        addItem(serviceBookingItem);
      }

      console.log('Adding service to cart:', serviceBookingItem, 'quantity:', quantity);

      toast({
        title: "✅ Servicio Agregado",
        description: `${quantity} ${quantity === 1 ? 'servicio' : 'servicios'} de ${service.service_name} agregado${quantity === 1 ? '' : 's'} al carrito`,
        variant: "default",
        duration: 4000,
      });

      onBookingSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding service to cart:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo agregar el servicio al carrito. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency || 'GTQ',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Reservar Servicio
          </DialogTitle>
          <DialogDescription>
            Selecciona la fecha y hora para tu reserva
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{service.service_name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{service.providers.business_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{service.providers.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">Precio: {service.currency === 'GTQ' ? 'Q.' : '$'}{service.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Information Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">
                    Información de tu perfil
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Los datos de contacto se obtienen automáticamente de tu perfil. Solo necesitas agregar notas adicionales si las tienes.
                </p>
              </div>

              {/* Client Information */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Cargando información del perfil..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Información de tu perfil</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Cargando información del perfil..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Información de tu perfil</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Cargando información del perfil..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Información de tu perfil</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Notas Adicionales</label>
                  <textarea
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Información adicional sobre tu mascota o necesidades especiales"
                    rows={3}
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700">Seleccionar Fecha *</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una fecha</option>
                  {availableDates.map(date => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Seleccionar Horario *</label>
                  {loading ? (
                    <div className="mt-1 p-4 text-center text-gray-500">
                      Cargando horarios disponibles...
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {availableTimeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`p-2 text-sm border rounded-md transition-colors ${
                            selectedTimeSlot === slot.id
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {formatTime(slot.slot_start_time)} - {formatTime(slot.slot_end_time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 p-4 text-center text-gray-500">
                      No hay horarios disponibles para esta fecha
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cantidad de Servicios</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {quantity === 1 ? '1 servicio' : `${quantity} servicios`} - Total: {formatPrice(service.price * quantity, service.currency)}
                </p>
              </div>

              {/* Booking Button */}
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTimeSlot || !clientInfo.name || !clientInfo.email || bookingLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {bookingLoading ? 'Agregando al Carrito...' : 'Agregar al Carrito'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingModal;
