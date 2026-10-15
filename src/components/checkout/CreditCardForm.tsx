import { useState, useEffect } from 'react';
import { CreditCard, Lock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CreditCardFormProps {
  onTokenGenerated: (token: string, cardData: any) => void;
  publicKey: string;
}

const useCreditCardForm = ({ onTokenGenerated, publicKey }: CreditCardFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mp, setMp] = useState<any>(null);

  useEffect(() => {
    // Carregar SDK do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      const mercadopago = new window.MercadoPago(publicKey);
      setMp(mercadopago);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [publicKey]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpirationDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpirationDate(formatExpirationDate(value));
    }
  };

  const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setSecurityCode(value);
    }
  };

  const handleDocNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setDocNumber(formatCPF(value));
    }
  };

  const translateMpError = (cause: any): string => {
    const code = String(cause?.code || cause?.error || '').toLowerCase();
    const msg = String(cause?.message || cause?.description || '').toLowerCase();
    if (code.includes('invalid_card_number') || msg.includes('card_number')) return 'Número do cartão inválido.';
    if (code.includes('invalid_expiration') || msg.includes('expiration')) return 'Data de validade inválida.';
    if (code.includes('invalid_security_code') || msg.includes('security_code') || msg.includes('cvv')) return 'Código de segurança (CVV) inválido.';
    if (code.includes('invalid_identification') || msg.includes('identification')) return 'CPF inválido.';
    if (code.includes('invalid_cardholder') || msg.includes('cardholder')) return 'Nome do titular inválido.';
    return 'Cartão inválido. Verifique os dados e tente novamente.';
  };

  const generateToken = async (): Promise<{ token: string; data: any } | null> => {
    if (!mp) {
      toast.error('SDK do Mercado Pago não carregado');
      return null;
    }

    if (!cardNumber || !cardholderName || !expirationDate || !securityCode || !docNumber) {
      toast.error('Preencha todos os campos do cartão');
      return null;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const cleanDocNumber = docNumber.replace(/\D/g, '');
    const [expMonth, expYear] = expirationDate.split('/');

    // Validações básicas client-side (defesa em profundidade — o MP é a fonte de verdade)
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      toast.error('Número do cartão inválido.');
      return null;
    }
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
      toast.error('Data de validade inválida.');
      return null;
    }
    const monthNum = parseInt(expMonth, 10);
    if (monthNum < 1 || monthNum > 12) {
      toast.error('Mês de validade inválido.');
      return null;
    }
    if (securityCode.length < 3 || securityCode.length > 4) {
      toast.error('CVV inválido.');
      return null;
    }
    if (cleanDocNumber.length !== 11) {
      toast.error('CPF inválido.');
      return null;
    }

    setIsLoading(true);

    try {
      const cardData = {
        cardNumber: cleanCardNumber,
        cardholderName: cardholderName,
        cardExpirationMonth: expMonth,
        cardExpirationYear: '20' + expYear,
        securityCode: securityCode,
        identificationType: 'CPF',
        identificationNumber: cleanDocNumber,
      };

      const token = await mp.createCardToken(cardData);

      // O SDK do MP pode retornar { cause: [...] } em caso de erro de validação
      if (token?.cause && Array.isArray(token.cause) && token.cause.length > 0) {
        const errMsg = translateMpError(token.cause[0]);
        toast.error(errMsg);
        return null;
      }

      if (!token?.id) {
        toast.error('Cartão inválido. Verifique os dados e tente novamente.');
        return null;
      }

      const data = {
        payment_method_id: token.payment_method_id,
        issuer_id: token.issuer_id,
        first_six_digits: token.first_six_digits,
        last_four_digits: token.last_four_digits,
      };
      onTokenGenerated(token.id, data);
      return { token: token.id, data };
    } catch (error: any) {
      console.error('Erro ao tokenizar cartão:', error);
      const causes = error?.cause || error?.causes;
      const errMsg = Array.isArray(causes) && causes.length > 0
        ? translateMpError(causes[0])
        : translateMpError(error);
      toast.error(errMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cardNumber,
    cardholderName,
    expirationDate,
    securityCode,
    docNumber,
    isLoading,
    handleCardNumberChange,
    handleExpirationChange,
    handleSecurityCodeChange,
    handleDocNumberChange,
    setCardholderName,
    generateToken,
  };
};

export default useCreditCardForm;
