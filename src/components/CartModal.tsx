import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, Package, Star } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { items, total, delivery_fee, grand_total } = state;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" aria-describedby="empty-cart-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrito Vacío
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8" id="empty-cart-description">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
            <p className="text-sm text-gray-400">Agrega productos o servicios para comenzar</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-auto" aria-describedby="cart-items-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrito de Compras ({items.length} {items.length === 1 ? 'item' : 'items'})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" id="cart-items-description">
          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {/* Item Image */}
                <div className="w-16 h-16 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.provider_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type === 'product' ? 'Producto' : 'Servicio'}
                        </Badge>
                        {item.has_delivery && (
                          <Badge variant="secondary" className="text-xs">
                            🚚 Entrega
                          </Badge>
                        )}
                        {item.has_pickup && (
                          <Badge variant="secondary" className="text-xs">
                            🏪 Recogida
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.currency === 'GTQ' ? 'Q.' : '$'}{item.price}
                      </p>
                      {item.delivery_fee && item.delivery_fee > 0 && (
                        <p className="text-xs text-gray-500">
                          +Q.{item.delivery_fee} entrega
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="flex-1"
            >
              Vaciar Carrito
            </Button>
            <Button
              onClick={onCheckout}
              className="flex-1"
              disabled={items.length === 0}
            >
              Proceder al Pago
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
