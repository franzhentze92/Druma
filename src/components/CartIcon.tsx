import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartIconProps {
  onOpenCart: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onOpenCart }) => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenCart}
      className="relative bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
      disabled={itemCount === 0}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartIcon;
