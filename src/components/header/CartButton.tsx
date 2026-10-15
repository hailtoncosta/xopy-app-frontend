import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartButtonProps {
  itemCount?: number;
  onClick?: () => void;
  className?: string;
}

const CartButton = ({ 
  itemCount = 0, 
  onClick, 
  className = "" 
}: CartButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`text-foreground hover:text-primary relative ${className}`}
      onClick={onClick}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartButton;