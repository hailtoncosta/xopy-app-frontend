import { useAuth } from '@/contexts/AuthContext';
import { MaskedInput } from '@/components/ui/masked-input';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Shield, Truck, Clock, Calendar, CheckCircle2, MessageCircle, Percent, HardHat, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
// Default imports for layout components
import BottomNavigation from '@/components/layout/BottomNavigation';
import MoreModal from '@/components/modals/MoreModal';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { request } from '@/integrations/api/client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { loadRentalCatalog, RentalItem } from '@/services/rentalService';
import RentalGallery from '@/components/rental/RentalGallery';
import RentalCostSimulator from '@/components/rental/RentalCostSimulator';
import { parseRentalMoney } from '@/utils/rentalCost';
export default function RentalDetail() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [item, setItem] = useState<RentalItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);
  const [owner, setOwner] = useState<{id: string; name: string; phone?: string; avatar_url?: string; total_rentals: number} | null>(null);
  const [ownerError, setOwnerError] = useState(false);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const { user: account } = useAuth();
  const isBusiness = account?.profileDetails?.type === 'business';
  const taxLabel = isBusiness ? 'CNPJ' : 'CPF';
  const documentLabels = isBusiness ? {contract: 'Contrato social', residence: 'Comprovante de residência', partner: 'Documento do sócio', cnpjDocument: 'Comprovante de CNPJ'} : {residence: 'Comprovante de residência', partner: 'Documento de identidade'};
  const [cnpj, setCnpj] = useState('');
  useEffect(() => { setCnpj(account?.profileDetails?.taxId || ''); setDocuments({}); }, [account?.id, account?.profileDetails?.type, account?.profileDetails?.taxId]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [sending, setSending] = useState(false);
  const loadVersion = useRef(0);
  useEffect(() => {
    if (id) {
      loadRentalItem(id);
    }
    return () => { loadVersion.current++; };
  }, [id]);
  const loadRentalItem = async (rentalId: string) => {
    const version = ++loadVersion.current;
    setLoading(true); setItem(null); setOwner(null); setOwnerError(false); setShowSimulator(false); setShowRentalModal(false); setRentalDays(1);
    try {
      const rentals = await loadRentalCatalog();
      if (version !== loadVersion.current) return;
      const rental = rentals.find(record => record.id === rentalId) || null;
      setItem(rental);
      if (rental) {
        try {
          const responsible = await request(`/site/rental-owners/equipment/${encodeURIComponent(rental.id)}`);
          if (version !== loadVersion.current) return;
          setOwner(responsible.id ? responsible : null);
        } catch { if (version === loadVersion.current) setOwnerError(true); }
      }
      setRelatedItems(rental ? rentals.filter(record => record.id !== rentalId && record.category === rental.category).slice(0, 4) : []);
    } catch (error) {
      console.error('Erro ao carregar locação:', error);
      if (version === loadVersion.current) toast.error('Erro ao carregar equipamento');
    } finally { if (version === loadVersion.current) setLoading(false); }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  if (!item) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Equipamento não encontrado</h1>
        <Button onClick={() => navigate('/categoria/locacoes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Locações
        </Button>
      </div>;
  }
  // Abrir modal para selecionar período
  const handleRentNow = () => {
    setShowRentalModal(true);
  };

  // Contato via WhatsApp
  const handleContact = () => {
    let phone = owner?.phone?.replace(/\D/g, '') || '';
    if (phone.length === 10 || phone.length === 11) phone = '55' + phone;
    if (!phone) { toast.error('O responsável não informou um telefone de contato'); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Olá, tenho interesse em alugar o equipamento: ${item.name}`)}`, '_blank', 'noopener,noreferrer');
  };

  // Usar a diária cadastrada; descontos dependem do orçamento do locador.
  const calculateDailyRate = (_days: number) => parseRentalMoney(item.price);

  // Calcular total
  const calculateTotal = () => {
    const dailyRate = calculateDailyRate(rentalDays);
    return dailyRate * rentalDays;
  };

  const handleConfirmRental = async () => {
    if (sending) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Faça login para enviar a solicitação'); navigate('/auth'); return; }
    const kinds = Object.keys(documentLabels);
    if (kinds.some(key => !documents[key]) || cnpj.replace(/\D/g, '').length !== (isBusiness ? 14 : 11) || deliveryAddress.trim().length < 10) {
      toast.error(`Informe o ${taxLabel}, endereço completo e anexe os documentos solicitados`); return;
    }
    setSending(true);
    try {
      const form = new FormData();
      form.set('equipmentId', item.id); form.set('days', String(rentalDays));
      form.set('taxId', cnpj); form.set('personType', isBusiness ? 'business' : 'individual'); form.set('deliveryAddress', deliveryAddress);
      kinds.forEach(key => form.set(key, documents[key]));
      await request('/rental-requests', 'POST', form);
      toast.success('Documentos enviados! Aguarde a aprovação da empresa.');
      setShowRentalModal(false); setDocuments({}); setCnpj(''); setDeliveryAddress('');
      navigate('/solicitacoes-aluguel?view=sent');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Erro ao enviar documentos'); }
    finally { setSending(false); }
  };
  return <div className="min-h-screen bg-white">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header fixo */}
      <div className="flex gap-3 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-black">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-black text-lg font-bold text-center">Detalhes da Locação</h1>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="pt-16 pb-20 overflow-auto max-w-screen-md md:max-w-2xl mx-auto">
        {/* Imagem do equipamento */}
        <div className="px-4 py-4">
          <div className="relative">
            <RentalGallery key={item.id} images={item.images} name={item.name} />
            {item.popular && <div className="absolute top-3 left-3">
                <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  POPULAR
                </div>
              </div>}
            <div className="absolute top-3 right-3">
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.available ? 'Disponível' : 'Indisponível'}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <h1 className="text-black text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-5">
          {item.name}
        </h1>
        <p className="text-black text-base font-normal leading-normal pb-3 pt-1 px-4">
          {item.description}
        </p>

        {/* Preço com card de desconto */}
        <div className="px-4 pb-4">
          <Button variant="outline" className="w-full mb-4 border-orange-300 text-orange-700 hover:bg-orange-50" onClick={() => setShowSimulator(true)}><Calculator className="w-4 h-4 mr-2" />Simular custos de locação</Button>

          <div className="flex items-baseline gap-2">
            <p className="text-blue-600 text-xl md:text-2xl font-bold">{item.price}</p>
            <p className="text-gray-600 text-xs md:text-sm">{item.period}</p>
          </div>
        </div>

        {/* Especificações */}
        <h3 className="text-black text-lg font-bold leading-tight px-4 pb-3 pt-4">Especificações</h3>
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-xs font-medium">Categoria</p>
              <p className="text-black text-xs font-semibold">{item.category}</p>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <p className="text-gray-600 text-xs font-medium">Localização</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-500" />
                <p className="text-black text-xs font-semibold">{item.location}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <p className="text-gray-600 text-xs font-medium">Disponibilidade</p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.available ? 'Disponível' : 'Em manutenção'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <p className="text-gray-600 text-xs font-medium">Entrega</p>
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-gray-500" />
                <p className="text-black text-xs font-semibold">Mesmo dia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-black text-2xl font-bold">{item.rating}</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-5 w-5 ${star <= Math.floor(item.rating) ? 'text-orange-600 fill-current' : 'text-gray-300'}`} />)}
            </div>
            <p className="text-gray-600 text-sm">({Math.floor(item.rating * 50)} avaliações)</p>
          </div>
        </div>

        {/* Benefícios da Locação */}
        <div className="px-4 pb-4">
          <h3 className="text-black text-lg font-bold mb-3">Benefícios inclusos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-blue-900">Entrega rápida</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-green-900">Equipamento revisado</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <HardHat className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-purple-900">Suporte técnico</span>
            </div>
          </div>
        </div>

        {/* Equipamentos relacionados */}
        {relatedItems.length > 0 && <div className="px-4 py-4">
            <h3 className="text-black text-lg font-bold mb-3">Equipamentos similares</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {relatedItems.map(relItem => <div key={relItem.id} onClick={() => navigate(`/locacao/${relItem.id}`)} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-none w-36 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="bg-gray-100">
                    <RentalGallery images={relItem.images} name={relItem.name} compact />
                  </div>
                  <div className="p-2">
                    <h4 className="text-black text-xs font-medium leading-tight mb-1">{relItem.name}</h4>
                    <div className="flex items-baseline gap-1">
                      <p className="text-blue-600 text-sm font-bold">{relItem.price}</p>
                      <p className="text-gray-500 text-xs">{relItem.period}</p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* Perfil da Empresa */}
        <div className="mx-4 mb-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {owner?.avatar_url ? <img src={owner.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" /> : <Truck className="h-6 w-6 text-blue-600" />}
            </div>
            <div className="flex-1">
              <h4 className="text-black text-sm font-bold">{owner?.name || (ownerError ? 'Não foi possível carregar o responsável' : 'Responsável não informado')}</h4>
              {owner && <p className="text-gray-600 text-xs mt-1">{Number(owner.total_rentals)} locações aprovadas</p>}
            </div>
            <button disabled={!owner}
              onClick={() => owner && navigate(`/rental-company/${owner.id}`)}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ver perfil
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-4 border-t sticky bottom-0 left-0 right-0 bg-white">
          <div className="flex gap-2 max-w-screen-xl mx-auto">
            <Button variant="outline" className="flex-1 bg-[#25D366] hover:bg-[#1FA855] text-white border-[#25D366]" onClick={handleContact} disabled={!item.available || !owner?.phone}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button className="flex-1 bg-[hsl(16,90%,46%)] hover:bg-[hsl(16,90%,40%)] text-white" onClick={handleRentNow} disabled={!item.available}>
              Solicitar
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation cartItemCount={0} onHomeClick={() => navigate('/')} onFavoritesClick={() => navigate('/favoritos')} onCartClick={() => navigate('/carrinho')} onClipsClick={() => navigate('/clips')} onMoreClick={() => setShowMoreModal(true)} />

      <MoreModal isOpen={showMoreModal} onClose={() => setShowMoreModal(false)} />

      <RentalCostSimulator key={item.id} open={showSimulator} onOpenChange={setShowSimulator} name={item.name} price={item.price} shippingCost={item.shipping_cost || 0} />

      {/* Modal de Seleção de Período */}
      {showRentalModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" onClick={(e) => {
          if (e.target === e.currentTarget) setShowRentalModal(false);
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .slide-up {
              animation: slideUp 0.3s ease-out;
            }
            .fade-in {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>
          
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Modal Content */}
          <div className="relative w-full md:w-auto md:min-w-[500px] md:max-w-[600px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl slide-up md:fade-in max-h-[85vh] md:max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-t-3xl flex-shrink-0">
              <h2 className="text-xl font-bold">Alugar Equipamento</h2>
              <p className="text-sm text-orange-100 mt-1 truncate">{item.name}</p>
            </div>
            
            {/* Conteúdo com scroll */}
            <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
              {/* Seleção de Dias */}
              <div>
                <Label htmlFor="rental_days" className="text-base font-semibold text-gray-900">
                  Por quantos dias?
                </Label>
                <Input 
                  id="rental_days" 
                  type="number" 
                  min="1" 
                  value={rentalDays} 
                  onChange={e => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))} 
                  className="mt-2 text-lg h-12 bg-white text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />

              </div>

              <div><Label htmlFor="rental-cnpj">{taxLabel}</Label><MaskedInput mask={isBusiness ? "cnpj" : "cpf"} id="rental-cnpj" value={cnpj} maxLength={isBusiness ? 18 : 14} onChange={e => setCnpj(e.target.value)} placeholder={isBusiness ? "00.000.000/0000-00" : "000.000.000-00"} /></div>
              <div><Label htmlFor="rental-address">Endereço de entrega</Label><Input id="rental-address" value={deliveryAddress} maxLength={2000} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Rua, número, complemento, bairro, cidade, UF e CEP" /></div>
              <p className="text-sm font-semibold">Frete do equipamento: {Number(item.shipping_cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-sm text-gray-600">Anexe os documentos em PDF, JPEG ou PNG, até 10 MB por arquivo.</p>
              {Object.entries(documentLabels).map(([key, label]) => <div key={key}>
                <Label htmlFor={'doc-' + key}>{label}</Label>
                <Input id={'doc-' + key} type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={sending} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 10 * 1024 * 1024) { toast.error('O arquivo deve possuir até 10 MB'); e.target.value = ''; setDocuments(prev => { const next = {...prev}; delete next[key]; return next; }); return; }
                  setDocuments(prev => { const next = {...prev}; if(file) next[key] = file; else delete next[key]; return next; });
                }} />
              </div>)}
              {/* Resumo de Valores */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Diária cadastrada:</span>
                  <span className="font-bold text-lg text-gray-900">R$ {calculateDailyRate(rentalDays).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Período:</span>
                  <span className="font-semibold text-gray-900">{rentalDays} dia{rentalDays > 1 ? 's' : ''}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Informação */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900">
                  <strong>Análise da empresa</strong><br />
                  Envie os documentos para a empresa analisar e aprovar sua solicitação de aluguel.
                </p>
              </div>
            </div>

            {/* Footer fixo */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-white rounded-b-3xl">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRentalModal(false)} 
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmRental} disabled={sending} 
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {sending ? 'Enviando...' : 'Enviar documentos para a empresa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>;
}