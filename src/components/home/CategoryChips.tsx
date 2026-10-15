import { HorizontalScroll } from './HorizontalScroll';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}
interface CategoryChipsProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}
const CategoryChips = ({
  categories,
  activeCategory: controlledActive,
  onCategoryChange,
  className = ""
}: CategoryChipsProps) => {
  const [internalActive, setInternalActive] = useState(controlledActive || categories.find(c => c.active)?.id || categories[0]?.id || "");
  const activeCategory = controlledActive !== undefined ? controlledActive : internalActive;
  const handleCategoryClick = (categoryId: string) => {
    if (controlledActive === undefined) {
      setInternalActive(categoryId);
    }
    onCategoryChange?.(categoryId);
  };
  const getCategoryColors = (categoryId: string, isActive: boolean) => {
    const colorMap: Record<string, {
      bg: string;
      text: string;
      border: string;
    }> = {
      tudo: {
        bg: isActive ? "bg-slate-600" : "bg-slate-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-slate-100"
      },
      ofertas: {
        bg: isActive ? "bg-yellow-500" : "bg-yellow-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-yellow-100"
      },
      servicos: {
        bg: isActive ? "bg-blue-500" : "bg-blue-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-blue-100"
      },
      destaques: {
        bg: isActive ? "bg-orange-500" : "bg-orange-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-orange-100"
      },
      "mais-vendidos": {
        bg: isActive ? "bg-green-500" : "bg-green-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-green-100"
      },
      queridinhos: {
        bg: isActive ? "bg-pink-500" : "bg-pink-300",
        text: isActive ? "text-white" : "text-black",
        border: "border-pink-100"
      }
    };
    return colorMap[categoryId] || {
      bg: isActive ? "bg-primary" : "bg-accent",
      text: isActive ? "text-primary-foreground" : "text-foreground",
      border: "border-border"
    };
  };
  return <section className={`pb-2 ${className}`}>
      <div className="container mx-auto my-0 px-[3px]">
        <HorizontalScroll label="Menu de categorias" autoPlay={false} compact>
        <div className="flex w-max min-w-full gap-2 py-1 px-10">
          {categories.map(category => {
          const IconComponent = category.icon;
          const isActive = activeCategory === category.id;
          const colors = getCategoryColors(category.id, isActive);
          return <Button key={category.id} data-carousel-image aria-pressed={isActive} variant="ghost" className={`
                  flex-shrink-0 min-w-[120px] h-12 rounded-lg px-4 py-3 
                  flex items-center justify-center gap-2 whitespace-nowrap
                  ${colors.bg} ${colors.text} ${colors.border}
                  font-medium border
                  ${isActive ? 'shadow-sm' : ''}
                `} onClick={() => handleCategoryClick(category.id)}>
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>;
        })}
        </div>
        </HorizontalScroll>
      </div>
    </section>;
};
export default CategoryChips;