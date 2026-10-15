import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  image_url: string;
  alt_text: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onBannerClick?: (banner: Banner) => void;
  isLoading?: boolean;
  onRealtimeUpdate?: (banners: Banner[]) => void;
}

const BannerCarousel = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
  onBannerClick,
  isLoading = false,
  onRealtimeUpdate
}: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false);

  // Preload das imagens
  useEffect(() => {
    const allBanners = banners || [];
    const validBanners = allBanners.filter(banner => banner && (banner.image_url || banner.imageUrl));
    
    validBanners.forEach((banner) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => new Set([...prev, banner.id]));
      };
      img.src = banner.image_url || banner.imageUrl || '';
    });
  }, [banners]);

  // Realtime updates para banners
  useEffect(() => {
    const channel = supabase.channel('banner-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'dynamic_banners'
    }, payload => {
      if (onRealtimeUpdate) {
        supabase.from('dynamic_banners').select('*').eq('is_active', true).order('order_index', {
          ascending: true
        }).then(({ data, error }) => {
          if (!error && data) {
            onRealtimeUpdate(data as Banner[]);
          }
        });
      }
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRealtimeUpdate]);

  // Verificações de segurança - filtrar apenas banners com imagens válidas
  const allBanners = banners || [];
  const safeBanners = allBanners.filter(banner => banner && (banner.image_url || banner.imageUrl) && banner.image_url !== null && banner.imageUrl !== null);
  const hasValidBanners = safeBanners.length > 0;

  useEffect(() => {
    if (!autoPlay || !hasValidBanners) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % safeBanners.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, safeBanners.length, hasValidBanners]);

  // Atualizar índice quando os banners mudarem
  useEffect(() => {
    if (currentIndex >= safeBanners.length && safeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners, safeBanners.length, currentIndex]);

  // Reset do estado de carregamento quando muda o banner
  useEffect(() => {
    const safeCurrentIndex = Math.min(currentIndex, safeBanners.length - 1);
    const currentBanner = safeBanners[safeCurrentIndex];
    if (currentBanner && imagesLoaded.has(currentBanner.id)) {
      setCurrentImageLoaded(true);
    } else {
      setCurrentImageLoaded(false);
    }
  }, [currentIndex, safeBanners, imagesLoaded]);

  const handleImageLoad = useCallback(() => {
    setCurrentImageLoaded(true);
  }, []);

  const goToPrevious = () => {
    if (!hasValidBanners) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + safeBanners.length) % safeBanners.length);
  };

  const goToNext = () => {
    if (!hasValidBanners) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % safeBanners.length);
  };

  const handleBannerClick = () => {
    if (hasValidBanners && safeBanners[currentIndex]) {
      onBannerClick?.(safeBanners[currentIndex]);
    }
  };

  if (isLoading) {
    return (
      <section className="py-3">
        <div className="container mx-auto px-2">
          <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden shadow-md">
            <Skeleton className="w-full h-32 md:h-40" />
          </div>
        </div>
      </section>
    );
  }

  if (!hasValidBanners) return null;

  const safeCurrentIndex = Math.min(currentIndex, safeBanners.length - 1);
  const currentBanner = safeBanners[safeCurrentIndex];

  return (
    <section className="py-3 px-0">
      <div className="container mx-auto py-0 px-0">
        <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden shadow-md">
          <div className="relative h-32 md:h-40">
            {/* Skeleton enquanto a imagem carrega */}
            {!currentImageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img 
              key={`banner-${currentBanner?.id}`} 
              src={currentBanner?.image_url || currentBanner?.imageUrl || ''} 
              alt={currentBanner?.alt_text || 'Banner'} 
              className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${currentImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={handleImageLoad}
              onError={e => {
                e.currentTarget.style.visibility = 'hidden';
                setCurrentImageLoaded(true);
              }} 
            />
            
            {/* Navigation Buttons */}
            {safeBanners.length > 1 && <>
              
              
              
            </>}
          </div>

          {/* Dots Indicator */}
          {safeBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {safeBanners.map((_, index) => (
                <button 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-colors ${index === safeCurrentIndex ? "bg-primary" : "bg-background/60"}`} 
                  onClick={() => setCurrentIndex(index)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;