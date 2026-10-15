import { HorizontalScroll } from './HorizontalScroll';
import { LucideIcon, Hammer, Paintbrush, Zap, Wrench, HardHat, Ruler, Scissors, Flower } from "lucide-react";
export interface ServiceCategory {
  id: string;
  name: string;
  icon: LucideIcon | string;
  description?: string;
  color?: string;
}
interface ServiceCategoriesProps {
  categories: ServiceCategory[];
  onCategoryClick?: (category: ServiceCategory) => void;
  className?: string;
}
const ServiceCategories = ({
  categories,
  onCategoryClick,
  className = ""
}: ServiceCategoriesProps) => {
  return <section className={`py-6 mb-4 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <h2 className="font-bold text-black text-xl">
            Prestadores de Serviços
          </h2>
          
        </div>
        
        <HorizontalScroll label="Prestadores de Serviços">
        <div className="flex gap-3 w-max min-w-full pb-3">
          {categories.map(category => {
          const getIconForCategory = (categoryId: string) => {
            switch (categoryId) {
              case 'pedreiro':
                return <Hammer className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'pintor':
                return <Paintbrush className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'eletricista':
                return <Zap className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'encanador':
                return <Wrench className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'engenheiro':
                return <HardHat className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'arquiteto':
                return <Ruler className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'marceneiro':
                return <Scissors className="h-8 w-8 text-white drop-shadow-lg" />;
              case 'jardineiro':
                return <Flower className="h-8 w-8 text-white drop-shadow-lg" />;
              default:
                return <Hammer className="h-8 w-8 text-white drop-shadow-lg" />;
            }
          };
          const getBackgroundColor = (categoryId: string) => {
            switch (categoryId) {
              case 'pedreiro':
                return 'bg-gradient-to-br from-orange-500 to-orange-700';
              case 'pintor':
                return 'bg-gradient-to-br from-blue-500 to-blue-700';
              case 'eletricista':
                return 'bg-gradient-to-br from-yellow-500 to-yellow-700';
              case 'encanador':
                return 'bg-gradient-to-br from-cyan-500 to-cyan-700';
              case 'engenheiro':
                return 'bg-gradient-to-br from-gray-600 to-gray-800';
              case 'arquiteto':
                return 'bg-gradient-to-br from-purple-500 to-purple-700';
              case 'marceneiro':
                return 'bg-gradient-to-br from-amber-600 to-amber-800';
              case 'jardineiro':
                return 'bg-gradient-to-br from-green-500 to-green-700';
              default:
                return 'bg-gradient-to-br from-orange-500 to-orange-700';
            }
          };
          const getTextColor = (categoryId: string) => {
            // Todos os ícones agora usam texto branco
            return 'text-white';
          };
          return <button key={category.id} className="group flex-none w-36 relative overflow-hidden rounded-xl bg-muted/30 hover:bg-muted/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={() => onCategoryClick?.(category)}>
                
                {/* Conteúdo do card */}
                <div data-carousel-image className="relative p-3 flex flex-col items-center justify-center gap-2 min-h-[120px] bg-stone-100">
                  {/* Ícone */}
                  <div className="transform transition-transform duration-300 group-hover:scale-110">
                    <div className={`p-2 rounded-lg ${getBackgroundColor(category.id)}`}>
                      {getIconForCategory(category.id)}
                    </div>
                  </div>
                  
                  {/* Nome da categoria */}
                  <div className="text-center">
                    <h3 className="text-sm font-bold line-clamp-2 text-neutral-700">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </button>;
        })}
        </div>
        </HorizontalScroll>
      </div>
    </section>;
};
export default ServiceCategories;