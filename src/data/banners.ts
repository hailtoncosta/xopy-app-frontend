// Imagens estáticas removidas - banners agora são dinâmicos do Supabase
// import bannerCimento from "@/assets/banner-cimento.jpg";
// import bannerPintura from "@/assets/banner-pintura.jpg";
// import bannerEngenheiro from "@/assets/banner-engenheiro.jpg";
// import bannerOfertas from "@/assets/banner-ofertas.jpg";
import { Banner } from "@/components/home/BannerCarousel";

// Fallback banners com imagens do Unsplash para compatibilidade
export const homeBanners: Banner[] = [
  {
    id: 1,
    title: "Promoção Cimento",
    description: "Até 30% de desconto em cimentos selecionados",
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop",
    alt_text: "Promoção Cimento",
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Semana da Pintura",
    description: "Tintas e acessórios com preços especiais",
    image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop",
    alt_text: "Semana da Pintura",
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Contrate um Engenheiro",
    description: "Profissionais qualificados para seu projeto",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    alt_text: "Contrate um Engenheiro",
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Ofertas Especiais do Mês",
    description: "Descontos imperdíveis em toda a loja",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    alt_text: "Ofertas Especiais do Mês",
    is_active: true,
    order_index: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];