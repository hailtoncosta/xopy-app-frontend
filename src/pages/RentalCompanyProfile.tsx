import { request } from '@/integrations/api/client';
import { loadRentalCatalog } from '@/services/rentalService';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Truck, Star, Shield, Clock, Phone, Mail } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/layout';
import { supabase } from '@/integrations/supabase/client';

interface RentalCompany {
  id: string;
  name: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  description?: string;
  joinedDate: string;
  totalRentals: number;
  rating: number;
}

interface RentalItem {
  id: string;
  name: string;
  category: string;
  price: string;
  period: string;
  image_url: string;
  available: boolean;
  rating: number;
}

const RentalCompanyProfile = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<RentalCompany | null>(null);
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount] = useState(0);

  useEffect(() => {
    if (companyId) {
      loadCompanyProfile(companyId);
    }
  }, [companyId]);

  const loadCompanyProfile = async (id: string) => {
    try {
      setLoading(true);

      setCompany(null); setRentals([]);
      const [responsible, catalog] = await Promise.all([request(`/site/rental-owners/${encodeURIComponent(id)}`), loadRentalCatalog()]);
      setCompany({id: responsible.id, name: responsible.name, avatar: responsible.avatar_url || undefined,
        phone: responsible.phone || undefined, joinedDate: responsible.created_at,
        totalRentals: Number(responsible.total_rentals || 0), rating: 0});
      setRentals(catalog.filter(item => item.user_id === responsible.id));
    } catch (error) {
      console.error('Erro ao carregar perfil da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatJoinedDate = (date: string) => {
    const joined = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Há ${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/carrinho')}
        onMenuClick={() => navigate('/profile')}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-[104px] sm:pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden flex-shrink-0">
              {company.avatar ? (
                <img
                  src={company.avatar}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <Truck className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {company.name}
              </h1>
              
              <p className="text-white text-sm mb-2">{company.totalRentals} locações aprovadas</p>

              {/* Location */}
              {(company.city || company.state) && (
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {company.city}
                    {company.city && company.state && ', '}
                    {company.state}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{rentals.length}</p>
                <p className="text-xs text-gray-600">Equipamentos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatJoinedDate(company.joinedDate).split(' ')[1]}
                </p>
                <p className="text-xs text-gray-600">
                  {formatJoinedDate(company.joinedDate).split(' ')[0] + ' ' + formatJoinedDate(company.joinedDate).split(' ')[2]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        {company.description && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Sobre a Empresa
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{company.description}</p>
            
            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{company.email}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{company.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">Diferenciais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-blue-900">Equipamentos Revisados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-blue-900">Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-blue-900">Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-blue-900">Frota Própria</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rentals Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Equipamentos Disponíveis
          </h2>

          {rentals.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum equipamento disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rentals.map((rental) => (
                <div
                  key={rental.id}
                  onClick={() => navigate(`/locacao/${rental.id}`)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Badge de disponibilidade */}
                  <div className="relative">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={rental.image_url}
                        alt={rental.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${
                      rental.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {rental.available ? 'Disponível' : 'Indisponível'}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      {rental.category}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mt-2 mb-2">
                      {rental.name}
                    </h3>
                    {rental.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-600">{rental.rating}</span>
                      </div>
                    )}
                    <div className="flex items-baseline">
                      <p className="text-lg font-bold text-blue-600">{rental.price}</p>
                      <span className="text-xs text-gray-500 ml-1">{rental.period}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation
        cartItemCount={cartItemCount}
        onHomeClick={() => navigate('/')}
        onFavoritesClick={() => navigate('/favoritos')}
        onCartClick={() => navigate('/carrinho')}
        onClipsClick={() => navigate('/clips')}
        onMoreClick={() => {}}
      />
    </div>
  );
};

export default RentalCompanyProfile;
