import { ShoppingCart, Menu } from "lucide-react";

interface HeaderActionsProps {
  cartItemCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  className?: string;
}

const HeaderActions = ({
  cartItemCount = 0,
  onMenuClick,
  onCartClick,
  className = ""
}: HeaderActionsProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button 
        className="relative p-2 hover:bg-orange-700 rounded-full transition-colors"
        onClick={onCartClick}
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {cartItemCount}
          </span>
        )}
      </button>
      
      <button 
        className="p-2 hover:bg-orange-700 rounded-full transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default HeaderActions;