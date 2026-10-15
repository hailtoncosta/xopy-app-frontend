import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronRight, Search, X, Send } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      text: 'Olá! Como posso ajudá-lo hoje?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Como faço para rastrear meu pedido?',
      answer: 'Você pode rastrear seu pedido na seção "Meus Pedidos" no seu perfil. Lá você encontrará o status atualizado e código de rastreamento.',
      category: 'Pedidos'
    },
    {
      id: '2',
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de acordo com sua localização e o produto escolhido. Geralmente é de 3 a 7 dias úteis para a região metropolitana.',
      category: 'Entrega'
    },
    {
      id: '3',
      question: 'Como posso cancelar um pedido?',
      answer: 'Pedidos podem ser cancelados até 2 horas após a confirmação. Acesse "Meus Pedidos" e clique em "Cancelar" no pedido desejado.',
      category: 'Pedidos'
    },
    {
      id: '4',
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos cartões de crédito, débito, PIX e boleto bancário. Todas as transações são seguras e criptografadas.',
      category: 'Pagamento'
    },
    {
      id: '5',
      question: 'Como funciona a política de troca e devolução?',
      answer: 'Você tem até 7 dias para solicitar troca ou devolução. O produto deve estar em perfeitas condições e na embalagem original.',
      category: 'Trocas'
    }
  ];

  const contactOptions = [
    {
      id: 'chat',
      title: 'Chat Online',
      description: 'Fale conosco agora',
      icon: MessageCircle,
      available: true
    },
    {
      id: 'phone',
      title: 'Telefone',
      description: '+55 98 8787-6077',
      icon: Phone,
      available: true
    },
    {
      id: 'email',
      title: 'Email',
      description: 'suporte@xopy.com.br',
      icon: Mail,
      available: true
    }
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactClick = (contactId: string) => {
    switch (contactId) {
      case 'chat':
        setIsChatModalOpen(true);
        break;
      case 'phone':
        // Abre WhatsApp com número da loja
        const phoneNumber = '559887876077'; // Número no formato internacional (sem + e espaços)
        const whatsappMessage = encodeURIComponent('Olá! Preciso de ajuda com meu pedido.');
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'email':
        // Abre cliente de email
        const emailSubject = encodeURIComponent('Suporte - Preciso de Ajuda');
        const emailBody = encodeURIComponent('Olá,\n\nPreciso de ajuda com:\n\n[Descreva seu problema aqui]\n\nObrigado!');
        const emailUrl = `mailto:suporte@xopy.com.br?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = emailUrl;
        break;
      default:
        console.log('Opção de contato não implementada:', contactId);
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simular resposta automática do suporte
    setTimeout(() => {
      const supportResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! Nossa equipe irá analisar e responder em breve. Tempo médio de resposta: 5 minutos.',
        sender: 'support',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, supportResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-black flex items-center">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-black text-lg font-bold flex-1 text-center pr-6">Central de Ajuda</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Contact Options */}
        <div className="mb-6">
          <h3 className="text-black text-lg font-bold mb-4">Entre em Contato</h3>
          <div className="space-y-3">
            {contactOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleContactClick(option.id)}
                  className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-black font-semibold">{option.title}</p>
                      <p className="text-gray-500 text-sm">{option.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h3 className="text-black text-lg font-bold mb-4">Perguntas Frequentes</h3>
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-orange-600 text-xs font-medium uppercase tracking-wide">
                        {faq.category}
                      </span>
                      <p className="text-black font-medium mt-1">{faq.question}</p>
                    </div>
                    <HelpCircle className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedFAQ === faq.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed pt-3">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma pergunta encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Tente usar outras palavras-chave</p>
            </div>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-orange-800 font-semibold mb-2">Não encontrou o que procura?</h4>
          <p className="text-orange-700 text-sm mb-3">
            Nossa equipe de suporte está sempre pronta para ajudar você.
          </p>
          <button 
            onClick={() => {
              const phoneNumber = '559887876077';
              const whatsappMessage = encodeURIComponent('Olá! Preciso de ajuda.');
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Falar com Suporte
          </button>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Chat Online</h3>
                  <p className="text-sm text-green-600">● Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-orange-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-black rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-orange-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim()}
                  className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              {/* Chat Info */}
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Horário de atendimento: Segunda a Sexta, 8h às 18h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;