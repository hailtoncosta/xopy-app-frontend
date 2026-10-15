import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Shield, Wrench, Truck, ChevronRight, Zap, Star } from 'lucide-react';

import { loadRentalCatalog, RentalItem } from '@/services/rentalService';
import RentalGallery from '@/components/rental/RentalGallery';

interface RentalSectionProps {
  onItemClick?: (item: RentalItem) => void;
  onViewMore?: () => void;
}

export const RentalSection = ({ onItemClick, onViewMore }: RentalSectionProps) => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const version = useRef(0);
  const [error, setError] = useState('');
  useEffect(() => {
    void loadRentals();
    const refresh = () => { void loadRentals(); };
    const storage = (event: StorageEvent) => { if (event.key === 'admin_content_updated') refresh(); };
    window.addEventListener('contentUpdated', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', storage);
    return () => {
      version.current++;
      window.removeEventListener('contentUpdated', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', storage);
    };
  }, []);

  const loadRentals = async () => {
    const current = ++version.current;
    try {
      const records = await loadRentalCatalog();
      if (current !== version.current) return;
      setRentals(records); setError('');
    } catch (error) {
      if (current === version.current) setError('Não foi possível carregar as locações.');
    } finally { if (current === version.current) setLoading(false); }
  };

  const handleItemClick = (item: RentalItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(`/locacao/${item.id}`);
    }
  };

  if (loading) {
    return <div className="py-8">Carregando locações...</div>;
  }

  if (error) return <div role="alert" className="p-4 mb-4 bg-red-50 rounded-lg text-red-700">{error}<button className="ml-3 underline" onClick={() => void loadRentals()}>Tentar novamente</button></div>;

  if (rentals.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header com gradiente especial */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-t-2xl p-4 md:p-6 text-white relative overflow-hidden">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <Truck className="h-16 w-16 rotate-12" />
          </div>
          <div className="absolute bottom-2 left-8">
            <Wrench className="h-12 w-12 -rotate-12" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 mr-2 md:mr-4">
                <Truck className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">Locações</h2>
                <p className="text-blue-100 text-xs md:text-sm">Locação de máquinas e ferramentas</p>
              </div>
            </div>
            
            {onViewMore && (
              <button 
                onClick={onViewMore}
                className="bg-white/20 backdrop-blur-sm rounded-full md:px-4 md:py-2 flex items-center hover:bg-white/30 transition-colors px-[14px] py-[4px]"
              >
                <span className="text-xs md:text-sm font-medium mr-1 px-[3px]">Tudo</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            )}
          </div>
          
          {/* Badges de benefícios */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1 flex items-center">
              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              <span className="text-xs font-medium">Entrega rápida</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1 flex items-center">
              <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              <span className="text-xs font-medium">Equipamentos revisados</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1 flex items-center">
              <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              <span className="text-xs font-medium">Suporte técnico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de produtos */}
      <div className="bg-white rounded-b-2xl border-2 border-t-0 border-blue-200 p-0">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4 pt-4">
          {rentals.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleItemClick(item)} 
              className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex-shrink-0 w-48 md:w-56 lg:w-64 snap-start ${
                item.popular ? 'border-orange-300 shadow-md' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Badge Popular */}
              {item.popular && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    POPULAR
                  </div>
                </div>
              )}

              {/* Badge de disponibilidade */}
              <div className="absolute top-2 right-2 z-10">
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.available ? 'Disponível' : 'Indisponível'}
                </div>
              </div>

              {/* Imagem */}
              <div className="relative overflow-hidden">
                <RentalGallery images={item.images} name={item.name} compact />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Em manutenção</span>
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-2 md:p-3">
                <div className="mb-2">
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 text-orange-500 fill-current" />
                  <span className="text-xs text-gray-600">{item.rating}</span>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline">
                    <span className="text-sm md:text-base font-bold text-blue-600">
                      {item.price}
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-500 ml-1">
                      {item.period}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleItemClick(item)}
                    className="bg-primary text-primary-foreground text-[11px] md:text-xs font-medium px-2 md:px-3 py-1 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!item.available}
                  >
                    {item.available ? 'Solicitar' : 'Indisponível'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-4 mx-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">
                Precisa de algo específico?
              </h3>
              <p className="text-blue-700 text-xs">
                Consulte nossa equipe para locações personalizadas
              </p>
            </div>
            <button 
              onClick={() => navigate('/consulta-locacao')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Consultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
