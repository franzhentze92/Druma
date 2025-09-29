import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CreditCard, Package, MapPin, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onSuccess }) => {
  const { state, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, total, delivery_fee, grand_total } = state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.email?.split('@')[0] || '',
    phone: '',
    address: '',
    city: '',
    deliveryInstructions: '',
    paymentMethod: 'card'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: "⚠️ Información Requerida",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Determine payment status based on payment method
      const paymentStatus = formData.paymentMethod === 'cash' ? 'completed' : 'completed'; // For now, all payments are completed
      
      // Debug: Log the data being sent
      console.log('Creating order with data:', {
        order_number: `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
        client_id: user?.id,
        total_amount: total,
        delivery_fee: delivery_fee,
        grand_total: grand_total,
        currency: items[0]?.currency || 'GTQ',
        payment_method: formData.paymentMethod,
        payment_status: paymentStatus,
        status: 'confirmed', // Set to confirmed since payment is completed
        delivery_name: formData.fullName,
        delivery_phone: formData.phone,
        delivery_address: formData.address,
        delivery_city: formData.city,
        delivery_instructions: formData.deliveryInstructions
      });

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          client_id: user?.id,
          total_amount: total,
          delivery_fee: delivery_fee,
          grand_total: grand_total,
          currency: items[0]?.currency || 'GTQ',
          payment_method: formData.paymentMethod,
          payment_status: paymentStatus,
          status: 'confirmed', // Set to confirmed since payment is completed
          delivery_name: formData.fullName,
          delivery_phone: formData.phone,
          delivery_address: formData.address,
          delivery_city: formData.city,
          delivery_instructions: formData.deliveryInstructions
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items - provider_id is already the user_id from cart
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        provider_id: item.provider_id, // This is already the user_id from providers table
        item_type: item.type,
        item_id: item.type === 'service' ? item.service_data?.service_id : item.id,
        item_name: item.name,
        item_description: item.description,
        item_image_url: item.image_url,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        currency: item.currency,
        provider_name: item.provider_name,
        provider_phone: null, // Optional field
        provider_address: null, // Optional field
        has_delivery: item.has_delivery || false,
        has_pickup: item.has_pickup || false,
        delivery_fee: item.delivery_fee || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create service appointments for service items
      const serviceItems = items.filter(item => item.type === 'service');
      if (serviceItems.length > 0) {
        const serviceAppointments = serviceItems.map(item => ({
          service_id: item.service_data?.service_id,
          client_id: user?.id,
          provider_id: providerUserMap.get(item.provider_id),
          appointment_date: item.service_data?.appointment_date,
          time_slot_id: item.service_data?.time_slot_id,
          status: 'pending',
          client_name: item.service_data?.client_name,
          client_phone: item.service_data?.client_phone,
          client_email: item.service_data?.client_email,
          notes: item.service_data?.notes,
          total_price: item.price * item.quantity,
          currency: item.currency
        }));

        const { error: appointmentsError } = await supabase
          .from('service_appointments')
          .insert(serviceAppointments);

        if (appointmentsError) {
          console.error('Error creating service appointments:', appointmentsError);
          // Don't throw error here, just log it - the order was created successfully
        }
      }
      
      // Set success state
      setIsSuccess(true);
      
      toast({
        title: "✅ Pago Exitoso",
        description: `Tu orden ${orderData.order_number} ha sido procesada correctamente.`,
        variant: "default",
        duration: 5000,
      });

      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        onSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        error: error
      });
      toast({
        title: "❌ Error en el Pago",
        description: `Hubo un problema procesando tu pago: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md text-center" aria-describedby="order-success-description">
          <DialogHeader>
            <DialogTitle>¡Orden Confirmada!</DialogTitle>
          </DialogHeader>
          <div className="py-8" id="order-success-description">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Gracias por tu compra!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu orden ha sido procesada exitosamente. Recibirás un email de confirmación.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Número de Orden:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="checkout-form-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Finalizar Compra
            </DialogTitle>
          </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="checkout-form-description">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen de la Orden</h3>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.provider_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'product' ? 'Producto' : 'Servicio'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {item.currency === 'GTQ' ? 'Q.' : '$'}{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {items[0]?.currency === 'GTQ' ? 'Q.' : '$'}{total.toFixed(2)}
                </span>
              </div>
              {delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Costo de entrega:</span>
                  <span className="font-medium">Q.{delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span>Total:</span>
                <span>{items[0]?.currency === 'GTQ' ? 'Q.' : '$'}{grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Entrega</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+502 1234-5678"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Dirección completa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryInstructions">Instrucciones de Entrega</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  placeholder="Instrucciones especiales para la entrega..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Método de Pago</Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="card">Tarjeta de Crédito/Débito</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia Bancaria</option>
                </select>
              </div>

              {/* Payment Method Info */}
              {formData.paymentMethod === 'card' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información de Pago</h4>
                  <p className="text-sm text-blue-800">
                    💳 Para esta demostración, el pago se procesará automáticamente.
                    <br />
                    🔒 En producción, se integrará con pasarelas de pago seguras.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando Pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirmar Pago - {items[0]?.currency === 'GTQ' ? 'Q.' : '$'}{grand_total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Checkout;
