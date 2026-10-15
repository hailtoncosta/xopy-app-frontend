import { PromotionalBannerData } from "@/components/home/PromotionalBanner";
import { StoreData } from "@/components/home/StoreCard";

export const smartHomeBanner: PromotionalBannerData = {
  id: "smart-home",
  title: "Casa Inteligente",
  subtitle: "Eletrônicos & Automação",
  description: "Produtos Eletrônicos e Automação",
  price: "R$ 89,90",
  features: ["Economia", "Controle app", "Fácil instalação"],
  buttonText: "Ver Produtos",
  gradient: "bg-gradient-to-r from-green-600 to-emerald-800",
  emoji: "🏠"
};

export const storeData: StoreData = {
  id: "casa-construcao",
  name: "Casa & Construção",
  subtitle: "Loja Oficial",
  description: "Materiais de construção com os melhores preços da região",
  rating: 4.8,
  reviewCount: "2.1k",
  features: ["Entrega rápida", "Até 18h"],
  gradient: "bg-gradient-to-r from-blue-600 to-blue-800",
  logo: "C"
};