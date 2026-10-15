import { MaskedInput } from '@/components/ui/masked-input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const equipmentTypes = [
  'Máquinas Pesadas',
  'Equipamentos Elétricos',
  'Ferramentas',
  'Plataformas',
  'Andaimes',
  'Compressores',
  'Geradores',
  'Betoneiras',
  'Outro'
];

export default function RentalInquiry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    equipment_type: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.city || !formData.equipment_type || !formData.description) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('rental_inquiries')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          equipment_type: formData.equipment_type,
          description: formData.description,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Consulta enviada com sucesso! Entraremos em contato em breve.');
      
      // Limpar formulário
      setFormData({
        name: '',
        phone: '',
        city: '',
        equipment_type: '',
        description: ''
      });

      // Voltar para home após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar consulta:', error);
      toast.error('Erro ao enviar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Wrench className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Consulta Personalizada</h1>
              <p className="text-blue-100">Nos conte o que você precisa e entraremos em contato</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone/WhatsApp *</Label>
              <MaskedInput mask="phone"
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Sua cidade - UF"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Tipo de Equipamento */}
            <div>
              <Label htmlFor="equipment_type">Tipo de Equipamento *</Label>
              <Select
                value={formData.equipment_type}
                onValueChange={(value) => setFormData({ ...formData, equipment_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição da Necessidade *</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o equipamento que você precisa, período de locação, condições especiais, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-gray-900 dark:text-white"
                rows={6}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Consulta
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📞 Retorno garantido:</strong> Nossa equipe analisará sua solicitação e entrará em contato em até 24 horas úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}