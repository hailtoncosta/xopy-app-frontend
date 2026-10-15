import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, Edit, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks';
import { paymentMethodService, PaymentMethod as PaymentMethodType } from '@/services/paymentMethodService';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'pix';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
}

const PaymentMethods = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    type: 'credit' as 'credit' | 'debit'
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [dbPaymentMethods, setDbPaymentMethods] = useState<PaymentMethodType[]>([]);

  // Carregar métodos de pagamento do banco
  useEffect(() => {
    if (user?.id) {
      loadPaymentMethods();
    }
  }, [user?.id]);

  const loadPaymentMethods = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const methods = await paymentMethodService.getUserPaymentMethods(user.id);
      setDbPaymentMethods(methods);
      
      // Converter para o formato da interface
      const formattedMethods: PaymentMethod[] = methods.map(method => ({
        id: method.id,
        type: method.payment_type === 'credit_card' ? 'credit' : method.payment_type === 'debit_card' ? 'debit' : 'pix',
        cardNumber: method.card_last_four ? `**** **** **** ${method.card_last_four}` : '',
        cardHolder: method.card_holder_name || '',
        expiryDate: method.card_expiry_month && method.card_expiry_year 
          ? `${method.card_expiry_month}/${method.card_expiry_year.slice(-2)}` 
          : '',
        isDefault: method.is_default
      }));
      
      setPaymentMethods(formattedMethods);
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      toast.error('Erro ao carregar cartões', {
        description: 'Não foi possível carregar seus cartões salvos.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-6 w-6 text-gray-600" />;
  };

  const getCardType = (type: string) => {
    switch (type) {
      case 'credit':
        return 'Crédito';
      case 'debit':
        return 'Débito';
      case 'pix':
        return 'PIX';
      default:
        return 'Cartão';
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!(await appConfirm('Tem certeza que deseja remover este cartão?'))) return;
    
    try {
      await paymentMethodService.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      toast.success('Cartão removido com sucesso!', {
        description: 'O cartão foi removido da sua conta.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      toast.error('Erro ao remover cartão', {
        description: 'Não foi possível remover o cartão. Tente novamente.',
        duration: 4000,
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodService.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
      toast.success('Cartão padrão definido!', {
        description: 'Este cartão será usado como padrão nos seus pagamentos.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao definir cartão padrão:', error);
      toast.error('Erro ao definir cartão padrão', {
        description: 'Não foi possível atualizar o cartão padrão. Tente novamente.',
        duration: 4000,
      });
    }
  };

  const handleAddCard = async () => {
    if (!user?.id) {
      toast.error('Login necessário', {
        description: 'Você precisa estar logado para adicionar um cartão.',
        duration: 4000,
      });
      return;
    }

    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate) {
      toast.error('Campos obrigatórios', {
        description: 'Por favor, preencha todos os campos obrigatórios.',
        duration: 4000,
      });
      return;
    }

    // Validar número do cartão
    const cleanCardNumber = newCard.cardNumber.replace(/\s/g, '');
    if (!paymentMethodService.validateCardNumber(cleanCardNumber)) {
      toast.error('Cartão inválido', {
        description: 'O número do cartão informado não é válido.',
        duration: 4000,
      });
      return;
    }

    // Validar data de validade
    const [month, year] = newCard.expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Últimos 2 dígitos
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      toast.error('Cartão vencido', {
        description: 'A data de validade do cartão já expirou.',
        duration: 4000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const cardBrand = paymentMethodService.getCardBrand(cleanCardNumber);
      const lastFour = cleanCardNumber.slice(-4);
      
      await paymentMethodService.createPaymentMethod(user.id, {
        payment_type: newCard.type === 'credit' ? 'credit_card' : 'debit_card',
        card_brand: cardBrand,
        card_last_four: lastFour,
        card_holder_name: newCard.cardHolder.toUpperCase(),
        card_expiry_month: month,
        card_expiry_year: `20${year}`,
        is_default: paymentMethods.length === 0
      });

      // Recarregar lista
      await loadPaymentMethods();
      
      // Limpar formulário
      setNewCard({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        type: 'credit'
      });
      
      setIsAddCardModalOpen(false);
      
      toast.success('Cartão adicionado!', {
        description: `Cartão ${cardBrand.toUpperCase()} •••• ${lastFour} foi adicionado com sucesso.`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      toast.error('Erro ao adicionar cartão', {
        description: 'Não foi possível adicionar o cartão. Tente novamente.',
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Formas de Pagamento</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Add New Payment Method */}
            <button 
              onClick={() => setIsAddCardModalOpen(true)}
              disabled={!user?.id}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 mb-6 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Adicionar novo cartão</span>
              </div>
            </button>

            {/* Empty State */}
            {paymentMethods.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">Nenhum cartão cadastrado</p>
                <p className="text-gray-400 text-sm">Adicione um cartão para facilitar suas compras</p>
              </div>
            )}

            {/* Payment Methods List */}
            <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getCardIcon(method.type)}
                  <div>
                    <p className="text-black font-semibold">{method.cardNumber}</p>
                    <p className="text-gray-500 text-sm">{getCardType(method.type)} • {method.expiryDate}</p>
                    <p className="text-gray-500 text-sm">{method.cardHolder}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => console.log('Edit card', method.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCard(method.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {method.isDefault && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                  <p className="text-orange-700 text-sm font-medium">Cartão padrão</p>
                </div>
              )}

              {!method.isDefault && (
                <button 
                  onClick={() => handleSetDefault(method.id)}
                  className="text-orange-600 text-sm font-medium hover:text-orange-700"
                >
                  Definir como padrão
                </button>
              )}
            </div>
          ))}
        </div>

            {/* PIX Section */}
            <div className="mt-6">
              <h3 className="text-black text-lg font-bold mb-4">Outras opções</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">PIX</span>
                  </div>
                  <div>
                    <p className="text-black font-semibold">PIX</p>
                    <p className="text-gray-500 text-sm">Pagamento instantâneo disponível no checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-black">Adicionar Cartão</h3>
              <button 
                onClick={() => setIsAddCardModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Card Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo do Cartão
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewCard(prev => ({ ...prev, type: 'credit' }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      newCard.type === 'credit' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Crédito
                  </button>
                  <button
                    onClick={() => setNewCard(prev => ({ ...prev, type: 'debit' }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      newCard.type === 'debit' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Débito
                  </button>
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    cardNumber: formatCardNumber(e.target.value) 
                  }))}
                  maxLength={19}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              {/* Card Holder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={newCard.cardHolder}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    cardHolder: e.target.value.toUpperCase() 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              {/* Expiry Date and CVV */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={newCard.expiryDate}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      expiryDate: formatExpiryDate(e.target.value) 
                    }))}
                    maxLength={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      cvv: e.target.value.replace(/\D/g, '') 
                    }))}
                    maxLength={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  🔒 Seus dados estão seguros e criptografados. O CVV não é armazenado.
                </p>
              </div>
              
              {/* Card Validation Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ℹ️ O número do cartão será validado automaticamente
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setIsAddCardModalOpen(false)}
                disabled={isSaving}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCard}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar Cartão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;