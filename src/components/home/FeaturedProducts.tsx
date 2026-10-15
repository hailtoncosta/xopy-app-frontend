import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

const FeaturedProducts = ({ 
  products, 
  onProductClick, 
  onAddToCart,
  className = "" 
}: FeaturedProductsProps) => {
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleProductClick = (product: Product) => {
    onProductClick?.(product);
  };

  return (
    <section className={`py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          Destaque
        </h2>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group hover:shadow-strong hover:-translate-y-1 transition-all duration-300 border-border cursor-pointer overflow-hidden backdrop-blur-sm flex-shrink-0 w-48"
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isOffer && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-destructive to-red-600 text-white text-xs font-bold shadow-lg animate-pulse">
                        Oferta
                      </Badge>
                    )}
                    <Badge 
                      variant="secondary" 
                      className={`absolute top-2 right-2 text-xs ${
                        product.category === 'Serviço' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-orange-light text-primary'
                      }`}
                    >
                      {product.category}
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-b from-background to-accent/20">
                    <h3 className="font-semibold text-xs text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2 bg-yellow-50 rounded-full px-2 py-1 w-fit">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-700">{product.rating}</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                         <div className="flex items-baseline gap-1">
                           <span className={`text-xs font-black ${product.isOffer ? 'text-destructive' : 'text-primary'} tracking-tight`}>
                             {product.price}
                           </span>
                         </div>
                      </div>
                      <Button 
                        size="icon"
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-secondary hover:from-orange-secondary hover:to-primary text-white shadow-medium hover:shadow-strong transform hover:scale-110 transition-all duration-200 active:scale-95"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;