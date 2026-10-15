import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface PromotionalBannerData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price?: string;
  features: string[];
  buttonText: string;
  gradient: string;
  emoji?: string;
}

interface PromotionalBannerProps {
  data: PromotionalBannerData;
  onClick?: () => void;
  className?: string;
}

const PromotionalBanner = ({ data, onClick, className = "" }: PromotionalBannerProps) => {
  return (
    <Card className={`overflow-hidden shadow-lg ${className}`}>
      <div className={`${data.gradient} p-4 md:p-6`}>
        {/* Layout Mobile */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {data.emoji && (
                <div className="bg-white/20 p-1.5 rounded-full mr-2">
                  <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm">{data.emoji}</span>
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-base">{data.title}</h3>
                <p className="text-white/80 text-xs">{data.subtitle}</p>
              </div>
            </div>
            {data.price && (
              <div className="text-right">
                <p className="text-white/70 text-xs">A partir de</p>
                <p className="text-white font-bold text-lg">{data.price}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/90 text-xs">
              {data.features.map((feature, index) => (
                <span key={index} className="flex items-center">
                  <span className="mr-1">✓</span>
                  {feature}
                </span>
              ))}
            </div>
            <Button 
              onClick={onClick}
              className="bg-white text-primary font-bold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors text-xs"
            >
              {data.buttonText}
            </Button>
          </div>
        </div>
        
        {/* Layout Desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center flex-1">
            {data.emoji && (
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm">{data.emoji}</span>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{data.title}</h3>
              <p className="text-white/80 text-sm mb-2">{data.description}</p>
              <div className="flex items-center gap-4 text-white/90 text-xs">
                {data.features.map((feature, index) => (
                  <span key={index} className="flex items-center">
                    <span className="text-white/70 mr-1">✓</span>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            {data.price && (
              <div className="mb-2">
                <p className="text-white/70 text-xs">A partir de</p>
                <p className="text-white font-bold text-xl">{data.price}</p>
              </div>
            )}
            <Button 
              onClick={onClick}
              className="bg-white text-primary font-bold px-6 py-2 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              {data.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromotionalBanner;