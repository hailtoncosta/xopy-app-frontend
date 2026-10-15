import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types";

const Favorites = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };



  const handleRemoveFavorite = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    removeFromFavorites(productId.toString());
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Meus Favoritos</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Adicione produtos aos seus favoritos clicando no coração
            </p>
            <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
              Explorar Produtos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Meus Favoritos</h1>
          <Badge variant="secondary" className="ml-auto">
            {favorites.length} {favorites.length === 1 ? 'item' : 'itens'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-strong hover:-translate-y-1 transition-all duration-300 border-border cursor-pointer overflow-hidden backdrop-blur-sm"
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 md:h-40 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isOffer && (
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-destructive to-red-600 text-white text-xs font-bold shadow-lg animate-pulse">
                      Oferta
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`absolute top-2 right-2 text-xs ${
                      product.type === 'serviço' 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-orange-light text-primary'
                    }`}
                  >
                    {product.type}
                  </Badge>
                  
                  {/* Botão de remover dos favoritos */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-primary hover:text-primary shadow-md"
                    // @ts-ignore
                    onClick={(e) => handleRemoveFavorite(e, product.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                
                <div className="p-4 bg-gradient-to-b from-background to-accent/20">
                  <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-start justify-start">
                    <span className="text-sm sm:text-lg font-black text-black tracking-tight">
                      {product.price}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;