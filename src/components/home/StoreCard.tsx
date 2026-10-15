import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export interface StoreData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rating: number;
  reviewCount: string;
  features: string[];
  gradient: string;
  logo?: string;
}

interface StoreCardProps {
  data: StoreData;
  onClick?: () => void;
  className?: string;
}

const StoreCard = ({ data, onClick, className = "" }: StoreCardProps) => {
  return (
    <Card className={`overflow-hidden shadow-lg ${className}`}>
      <div className={`${data.gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="bg-white/20 p-1.5 rounded-full mr-2">
                <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">
                    {data.logo || data.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{data.name}</h3>
                <p className="text-white/80 text-xs">{data.subtitle}</p>
              </div>
            </div>
            <p className="text-white/90 text-xs mb-2">{data.description}</p>
            <div className="flex items-center space-x-3 text-white/80 text-xs">
              <span className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-300 text-yellow-300 mr-1" />
                {data.rating} ({data.reviewCount})
              </span>
              {data.features.map((feature, index) => (
                <span key={index}>• {feature}</span>
              ))}
            </div>
          </div>
          <div className="ml-4">
            <Button 
              onClick={onClick}
              className="bg-white text-primary font-bold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              Visitar Loja
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StoreCard;