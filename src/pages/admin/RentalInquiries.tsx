import { request } from '@/integrations/api/client';
import { MaskedInput } from '@/components/ui/masked-input';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Wrench,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RentalInquiry {
  source?: string;
  id: string;
  name: string;
  phone: string;
  city: string;
  equipment_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  whatsapp_contact: string | null;
  rental_item_id: string | null;
  rental_item_name: string | null;
  rental_days: number | null;
  daily_rate: number | null;
  total_amount: number | null;
  deposit_amount: number | null;
  payment_method: string | null;
  payment_status: string | null;
  pix_code: string | null;
  pix_qr_code: string | null;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-500', icon: MessageSquare },
  completed: { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
};

export default function RentalInquiries() {
  const [inquiries, setInquiries] = useState<RentalInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<RentalInquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<RentalInquiry['status']>('pending');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pendente');

  useEffect(() => {
    loadInquiries();

    // Real-time subscription
    const channel = supabase
      .channel('rental_inquiries_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rental_inquiries'
      }, () => {
        loadInquiries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadInquiries = async () => {
    try {
      const data=await request('/admin/rental-inquiries');
      setInquiries((data || []).map((row:any)=>({...row,status:statusConfig[row.status]?row.status:'pending',name:row.name || '',phone:row.phone || '',city:row.city || '',equipment_type:row.equipment_type || '',daily_rate:row.daily_rate==null?null:Number(row.daily_rate),total_amount:row.total_amount==null?null:Number(row.total_amount),deposit_amount:row.deposit_amount==null?null:Number(row.deposit_amount)})));
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (inquiry: RentalInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setNewStatus(inquiry.status);
    setWhatsappContact(inquiry.whatsapp_contact || '');
    setPaymentStatus(inquiry.payment_status || 'nao_informado');
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry || selectedInquiry.source==='request') return;

    try {
      const { error } = await supabase
        .from('rental_inquiries')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          whatsapp_contact: whatsappContact,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInquiry.id);

      if (error) throw error;

      toast.success('Consulta atualizada com sucesso!');
      setSelectedInquiry(null);
      loadInquiries();
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      toast.error('Erro ao atualizar consulta');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando consultas...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas de Locação</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as solicitações de locação personalizadas dos clientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inquiries.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inquiries.filter(i => i.status === 'in_progress').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {inquiries.filter(i => i.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inquiries.length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-gray-500" />
            </div>
          </Card>
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <Card className="p-12 text-center">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma consulta recebida ainda</p>
            </Card>
          ) : (
            inquiries.map((inquiry) => {
              const StatusIcon = statusConfig[inquiry.status].icon;
              return (
                <Card key={`${inquiry.source || 'inquiry'}-${inquiry.id}`} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {inquiry.name}
                            </h3>
                            <Badge className={`${statusConfig[inquiry.status].color} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[inquiry.status].label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {inquiry.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              {inquiry.city}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(inquiry.created_at)}
                            </div>
                          </div>

                          <div className="mb-3">
                            <Badge variant="outline" className="bg-blue-50">
                              {inquiry.equipment_type}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                            {inquiry.description}
                          </p>

                          {inquiry.rental_item_name && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                <p className="text-xs font-medium text-blue-800">
                                  Equipamento: {inquiry.rental_item_name}
                                </p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-900">
                                <div>
                                  <span className="text-blue-700">Dias:</span> {inquiry.rental_days}
                                </div>
                                <div>
                                  <span className="text-blue-700">Total:</span> R$ {inquiry.total_amount?.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-blue-700">Entrada (50%):</span> R$ {inquiry.deposit_amount?.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-blue-700">Pagamento:</span> {inquiry.payment_method?.toUpperCase()}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <Badge className={`text-xs ${
                                  inquiry.payment_status === 'pago' ? 'bg-green-500' : 
                                  inquiry.payment_status === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}>
                                  {!inquiry.payment_status ? 'Não informado' : inquiry.payment_status === 'pago' ? '✓ Pago' : 
                                   inquiry.payment_status === 'cancelado' ? '✗ Cancelado' : '⏳ Pendente'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {inquiry.admin_notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                              <p className="text-xs font-medium text-yellow-800 mb-1">
                                Notas do Admin:
                              </p>
                              <p className="text-sm text-yellow-900">
                                {inquiry.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleOpenDetails(inquiry)}
                      variant="outline"
                      size="sm"
                    >
                      Gerenciar
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Consulta</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nome</p>
                  <p className="text-base">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Telefone</p>
                  <p className="text-base">{selectedInquiry.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Cidade</p>
                  <p className="text-base">{selectedInquiry.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Equipamento</p>
                  <p className="text-base">{selectedInquiry.equipment_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Descrição</p>
                <p className="text-base bg-gray-50 p-3 rounded-lg">
                  {selectedInquiry.description}
                </p>
              </div>

              {selectedInquiry.rental_item_name && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Detalhes da Locação
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Equipamento:</p>
                      <p className="font-semibold">{selectedInquiry.rental_item_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dias:</p>
                      <p className="font-semibold">{selectedInquiry.rental_days}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Diária:</p>
                      <p className="font-semibold">R$ {selectedInquiry.daily_rate?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total:</p>
                      <p className="font-semibold">R$ {selectedInquiry.total_amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Entrada (50%):</p>
                      <p className="font-semibold text-blue-600">R$ {selectedInquiry.deposit_amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Forma de Pagamento:</p>
                      <p className="font-semibold">{selectedInquiry.payment_method?.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="whatsapp_contact">
                  WhatsApp de Contato
                </Label>
                <MaskedInput mask="whatsapp"
                  id="whatsapp_contact"
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este número será usado no botão WhatsApp da página de detalhes
                </p>
              </div>

              <div>
                <Label htmlFor="payment_status">
                  Status do Pagamento
                </Label>
                <Select disabled value={paymentStatus || 'nao_informado'} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedInquiry.source==='request' && <p className="text-sm text-gray-500">Esta solicitação é exibida para consulta. Sua aprovação segue o fluxo de solicitações de aluguel.</p>}
              {/* Informações de Pagamento PIX */}
              {selectedInquiry.payment_method === 'pix' && selectedInquiry.pix_code && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Informações PIX
                  </h4>
                  {selectedInquiry.pix_qr_code && (
                    <div className="flex justify-center bg-white rounded-lg p-3">
                      <img src={selectedInquiry.pix_qr_code} alt="QR Code PIX" className="w-40 h-40" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-blue-700 font-medium mb-1">Código Copia e Cola:</p>
                    <p className="text-xs font-mono bg-white p-2 rounded break-all border border-blue-200">
                      {selectedInquiry.pix_code}
                    </p>
                  </div>
                </div>
              )}

              {/* Card data is no longer stored — payments processed via Mercado Pago tokenization */}

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RentalInquiry['status'])}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Notas Administrativas
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione observações sobre o atendimento..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateInquiry} disabled={selectedInquiry?.source==='request'}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}