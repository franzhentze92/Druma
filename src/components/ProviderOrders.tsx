import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Eye,
  User,
  AlertCircle,
  Coins,
  Play,
  RotateCcw,
  CheckSquare
} from 'lucide-react';

interface ProviderOrder {
  id: string;
  order_number: string;
  total_amount: number;
  delivery_fee: number;
  grand_total: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_instructions?: string;
  created_at: string;
  delivered_at?: string;
  client_email?: string;
  order_items: ProviderOrderItem[];
}

interface ProviderOrderItem {
  id: string;
  item_type: 'product' | 'service';
  item_id: string;
  item_name: string;
  item_description?: string;
  item_image_url?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  currency: string;
  provider_name: string;
  has_delivery: boolean;
  has_pickup: boolean;
  delivery_fee: number;
  created_at: string;
}

const ProviderOrders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ProviderOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch provider orders
  useEffect(() => {
    const fetchProviderOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get orders that contain items from this provider
        const { data: orderItemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            orders (*)
          `)
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;

        // Get unique order IDs to fetch client emails
        const orderIds = [...new Set(orderItemsData?.map(item => item.order_id) || [])];
        
        // Fetch client emails separately from orders table
        const clientEmailsMap = new Map<string, string>();
        if (orderIds.length > 0) {
          try {
            const { data: ordersData, error: ordersError } = await supabase
              .from('orders')
              .select('id, client_email')
              .in('id', orderIds);
            
            if (!ordersError && ordersData) {
              ordersData.forEach(order => {
                clientEmailsMap.set(order.id, order.client_email || 'N/A');
              });
            }
          } catch (error) {
            console.log('Could not fetch client emails:', error);
          }
        }

        // Group order items by order_id and create order objects
        const ordersMap = new Map<string, ProviderOrder>();
        
        orderItemsData?.forEach((item) => {
          const order = item.orders;
          if (!order) return;

          const orderId = order.id;
          
          if (!ordersMap.has(orderId)) {
            ordersMap.set(orderId, {
              id: order.id,
              order_number: order.order_number,
              total_amount: order.total_amount,
              delivery_fee: order.delivery_fee,
              grand_total: order.grand_total,
              currency: order.currency,
              status: order.status,
              payment_method: order.payment_method,
              payment_status: order.payment_status,
              delivery_name: order.delivery_name,
              delivery_phone: order.delivery_phone,
              delivery_address: order.delivery_address,
              delivery_city: order.delivery_city,
              delivery_instructions: order.delivery_instructions,
              created_at: order.created_at,
              delivered_at: order.delivered_at,
              client_email: clientEmailsMap.get(order.id) || 'N/A',
              order_items: []
            });
          }

          // Add this provider's items to the order
          ordersMap.get(orderId)?.order_items.push({
            id: item.id,
            item_type: item.item_type,
            item_id: item.item_id,
            item_name: item.item_name,
            item_description: item.item_description,
            item_image_url: item.item_image_url,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price,
            currency: item.currency,
            provider_name: item.provider_name,
            has_delivery: item.has_delivery,
            has_pickup: item.has_pickup,
            delivery_fee: item.delivery_fee,
            created_at: item.created_at
          });
        });

        const ordersArray = Array.from(ordersMap.values());
        setOrders(ordersArray);
      } catch (error) {
        console.error('Error fetching provider orders:', error);
        console.error('Full error object:', error);
        
        // Log more specific error details
        if (error && typeof error === 'object' && 'code' in error) {
          console.error('Error code:', (error as any).code);
          console.error('Error message:', (error as any).message);
          console.error('Error details:', (error as any).details);
        }
        
        toast({
          title: "❌ Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviderOrders();
  }, [user, toast]);

  // Get status badge variant with distinct colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          variant: 'secondary' as const, 
          icon: Clock, 
          label: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        };
      case 'confirmed':
        return { 
          variant: 'default' as const, 
          icon: CheckCircle, 
          label: 'Confirmada',
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        };
      case 'processing':
        return { 
          variant: 'default' as const, 
          icon: Package, 
          label: 'Procesando',
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
        };
      case 'shipped':
        return { 
          variant: 'default' as const, 
          icon: Truck, 
          label: 'Enviada',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200'
        };
      case 'delivered':
        return { 
          variant: 'default' as const, 
          icon: CheckCircle, 
          label: 'Entregada',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        };
      case 'cancelled':
        return { 
          variant: 'destructive' as const, 
          icon: XCircle, 
          label: 'Cancelada',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        };
      default:
        return { 
          variant: 'secondary' as const, 
          icon: Clock, 
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
    }
  };

  // Get payment status badge with distinct colors
  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return { 
          variant: 'default' as const, 
          label: 'Pagado',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
        };
      case 'pending':
        return { 
          variant: 'secondary' as const, 
          label: 'Pendiente',
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
        };
      case 'failed':
        return { 
          variant: 'destructive' as const, 
          label: 'Falló',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        };
      case 'refunded':
        return { 
          variant: 'outline' as const, 
          label: 'Reembolsado',
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
      default:
        return { 
          variant: 'secondary' as const, 
          label: paymentStatus,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus,
                ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
              }
            : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          status: newStatus,
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
        } : null);
      }

      const statusMessages = {
        'confirmed': '✅ Orden Confirmada',
        'processing': '🔄 Orden en Procesamiento',
        'shipped': '🚚 Orden Enviada',
        'delivered': '🎯 Orden Entregada',
        'cancelled': '❌ Orden Cancelada'
      };

      const statusDescriptions = {
        'confirmed': 'La orden ha sido confirmada y está lista para procesar.',
        'processing': 'La orden está siendo preparada.',
        'shipped': 'La orden ha sido enviada al cliente.',
        'delivered': 'La orden ha sido entregada exitosamente.',
        'cancelled': 'La orden ha sido cancelada.'
      };

      toast({
        title: statusMessages[newStatus as keyof typeof statusMessages] || 'Estado Actualizado',
        description: statusDescriptions[newStatus as keyof typeof statusDescriptions] || 'El estado de la orden ha sido actualizado.',
        variant: newStatus === 'cancelled' ? 'destructive' : 'default',
        duration: 4000,
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "❌ Error al Actualizar",
        description: `No se pudo actualizar el estado de la orden: ${errorMessage}`,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get available actions for order status
  const getAvailableActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { status: 'confirmed', label: 'Confirmar Orden', icon: CheckCircle, variant: 'default' as const },
          { status: 'cancelled', label: 'Cancelar Orden', icon: XCircle, variant: 'destructive' as const }
        ];
      case 'confirmed':
        return [
          { status: 'processing', label: 'Marcar como Procesando', icon: Play, variant: 'default' as const },
          { status: 'cancelled', label: 'Cancelar Orden', icon: XCircle, variant: 'destructive' as const }
        ];
      case 'processing':
        return [
          { status: 'shipped', label: 'Marcar como Enviada', icon: Truck, variant: 'default' as const },
          { status: 'cancelled', label: 'Cancelar Orden', icon: XCircle, variant: 'destructive' as const }
        ];
      case 'shipped':
        return [
          { status: 'delivered', label: 'Marcar como Entregada', icon: CheckSquare, variant: 'default' as const }
        ];
      case 'delivered':
        return []; // No further actions for delivered orders
      case 'cancelled':
        return []; // No actions for cancelled orders
      default:
        return [];
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view order details
  const handleViewDetails = (order: ProviderOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  // Calculate totals
  const totalRevenue = orders
    .filter(order => order.payment_status === 'completed')
    .reduce((sum, order) => {
      const providerTotal = order.order_items.reduce((itemSum, item) => itemSum + item.total_price, 0);
      return sum + providerTotal;
    }, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes Recibidas</h1>
        <p className="text-gray-600">Gestiona las órdenes de tus productos y servicios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">Q.{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="processing">Procesando</option>
          <option value="shipped">Enviadas</option>
          <option value="delivered">Entregadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'No tienes órdenes aún' : 'No hay órdenes con este filtro'}
            </h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? 'Cuando los clientes compren tus productos o servicios, aparecerán aquí'
                : 'Intenta cambiar el filtro para ver más órdenes'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            const paymentBadge = getPaymentStatusBadge(order.payment_status);
            const providerTotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Orden {order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={statusBadge.variant} className={`flex items-center gap-1 ${statusBadge.className}`}>
                          <statusBadge.icon className="w-3 h-3" />
                          {statusBadge.label}
                        </Badge>
                        <Badge variant={paymentBadge.variant} className={paymentBadge.className}>
                          {paymentBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        Q.{providerTotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Client Info */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{order.delivery_name}</p>
                        <p className="text-sm text-gray-600">{order.client_email}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.delivery_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {order.delivery_city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Tus Productos ({order.order_items.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.order_items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-12 h-12 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                              {item.item_image_url ? (
                                <img 
                                  src={item.item_image_url} 
                                  alt={item.item_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.item_type === 'product' ? 'Producto' : 'Servicio'}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {item.quantity}x Q.{item.unit_price}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                Q.{item.total_price}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 2 && (
                          <div className="flex items-center justify-center p-3 border rounded-lg border-dashed border-gray-300">
                            <p className="text-sm text-gray-500">
                              +{order.order_items.length - 2} más
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                      
                      {/* Status Update Actions */}
                      <div className="flex items-center gap-2">
                        {getAvailableActions(order.status).map((action) => {
                          const IconComponent = action.icon;
                          return (
                            <Button
                              key={action.status}
                              variant={action.variant}
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, action.status)}
                              disabled={updatingStatus === order.id}
                              className="text-xs"
                            >
                              <IconComponent className="w-3 h-3 mr-1" />
                              {updatingStatus === order.id ? 'Actualizando...' : action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="order-details-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalles de Orden {selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6" id="order-details-description">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Información de la Orden</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <Badge variant={getStatusBadge(selectedOrder.status).variant} className={getStatusBadge(selectedOrder.status).className}>
                        {getStatusBadge(selectedOrder.status).label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pago:</span>
                      <Badge variant={getPaymentStatusBadge(selectedOrder.payment_status).variant} className={getPaymentStatusBadge(selectedOrder.payment_status).className}>
                        {getPaymentStatusBadge(selectedOrder.payment_status).label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    {selectedOrder.delivered_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entregado:</span>
                        <span>{formatDate(selectedOrder.delivered_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Información del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre:</span>
                      <p>{selectedOrder.delivery_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p>{selectedOrder.client_email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <p>{selectedOrder.delivery_phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Dirección:</span>
                      <p>{selectedOrder.delivery_address}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ciudad:</span>
                      <p>{selectedOrder.delivery_city}</p>
                    </div>
                    {selectedOrder.delivery_instructions && (
                      <div>
                        <span className="text-gray-600">Instrucciones:</span>
                        <p>{selectedOrder.delivery_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Provider's Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tus Productos en esta Orden</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                        {item.item_image_url ? (
                          <img 
                            src={item.item_image_url} 
                            alt={item.item_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                        {item.item_description && (
                          <p className="text-sm text-gray-500 mt-1">{item.item_description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">
                            {item.item_type === 'product' ? 'Producto' : 'Servicio'}
                          </Badge>
                          {item.has_delivery && (
                            <Badge variant="secondary">🚚 Entrega</Badge>
                          )}
                          {item.has_pickup && (
                            <Badge variant="secondary">🏪 Recogida</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x Q.{item.unit_price}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          Q.{item.total_price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider's Earnings */}
              <div className="border-t pt-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Tus Ganancias</h3>
                  <div className="text-2xl font-bold text-green-900">
                    Q.{selectedOrder.order_items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Por {selectedOrder.order_items.length} {selectedOrder.order_items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>

              {/* Status Update Actions */}
              {getAvailableActions(selectedOrder.status).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Acciones Disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableActions(selectedOrder.status).map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={action.status}
                          variant={action.variant}
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, action.status);
                            setShowOrderDetails(false);
                          }}
                          disabled={updatingStatus === selectedOrder.id}
                          className="flex items-center gap-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          {updatingStatus === selectedOrder.id ? 'Actualizando...' : action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProviderOrders;
