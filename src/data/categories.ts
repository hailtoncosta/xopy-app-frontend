import { Tag, Wrench, Star, TrendingUp, Heart } from "lucide-react";
import { Category } from "@/components/home";

export const homeCategories: Category[] = [
  { id: "ofertas", label: "Ofertas", icon: Tag, active: true },
  { id: "servicos", label: "Serviços", icon: Wrench, active: false },
  { id: "destaques", label: "Destaques", icon: Star, active: false },
  { id: "mais-vendidos", label: "Mais vendidos", icon: TrendingUp, active: false },
  { id: "queridinhos", label: "Queridinhos", icon: Heart, active: false },
];