import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { Truck, Tag, Grid } from "lucide-react";

export interface PromotionalItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  bgColor?: string;
  iconColor?: string;
}

interface PromotionalSectionProps {
  items?: PromotionalItem[];
  className?: string;
}

const PromotionalSection = ({
  items = [],
  className = ""
}: PromotionalSectionProps) => {
  const { promo, shipping } = useSettings();

  // Usar configurações dinâmicas do admin se disponíveis
  const dynamicItems: PromotionalItem[] = promo && shipping ? [
    {
      id: 'free-shipping',
      icon: Truck,
      title: promo.freeShippingTitle || 'Frete grátis',
      description: promo.freeShippingSubtext || `Válido para compras acima de R$ ${shipping.freeShippingThreshold || 400}`,
      gradient: '',
      bgColor: (promo as any).freeShippingBgColor || '#10b98120',
      iconColor: (promo as any).freeShippingIconColor || '#10b981'
    },
    {
      id: 'discounts',
      icon: Tag,
      title: promo.discountTitle || 'Descontos especiais',
      description: promo.discountDescription || 'Aproveite nossas ofertas',
      gradient: 'bg-gradient-to-r from-orange-500/10 to-red-600/10'
    },
    {
      id: 'category-offers',
      icon: Grid,
      title: promo.categoryOfferTitle || 'Ofertas por categoria',
      description: promo.categoryOfferDescription || 'Veja todas as categorias',
      gradient: 'bg-gradient-to-r from-blue-500/10 to-purple-600/10'
    }
  ] : [];

  const displayItems = dynamicItems.length > 0 ? dynamicItems : items;

  if (displayItems.length === 0) return null;
  return <section className={`py-2 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid gap-4">
          {displayItems.map(item => {
          const IconComponent = item.icon;
          const cardStyle = item.bgColor ? { backgroundColor: item.bgColor } : {};
          const iconStyle = item.iconColor ? { backgroundColor: item.iconColor } : {};
          
          return <Card 
              key={item.id} 
              className={`${item.gradient || 'bg-gradient-to-r from-orange-light to-background'} border-primary/20 shadow-soft`}
              style={item.bgColor ? cardStyle : undefined}
            >
                <div className="flex items-center justify-center gap-3 px-4 py-0">
                  <div 
                    className="flex items-center justify-center w-12 h-12 rounded-full"
                    style={item.iconColor ? iconStyle : { backgroundColor: 'hsl(var(--primary))' }}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default PromotionalSection;