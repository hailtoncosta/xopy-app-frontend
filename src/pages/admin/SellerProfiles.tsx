import { MaskedInput } from '@/components/ui/masked-input';
import { appConfirm } from '@/lib/feedback';
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Store, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/admin/ImageUpload';

interface SellerProfile {
  id: string;
  user_id: string;
  full_name: string;
  business_name?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  description?: string;
  rating: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

const SellerProfiles = () => {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SellerProfile>>({
    full_name: '',
    business_name: '',
    avatar_url: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    description: '',
    rating: 4.8,
    total_sales: 0
  });

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      
      // Buscar perfis de vendedores
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear para o formato esperado
      const mappedSellers: SellerProfile[] = (data || []).map((profile: any) => ({
        id: profile.id,
        user_id: profile.id,
        full_name: profile.full_name || 'Vendedor',
        business_name: undefined,
        avatar_url: profile.avatar_url,
        address: undefined,
        city: undefined,
        state: undefined,
        phone: profile.phone,
        email: profile.email,
        description: undefined,
        rating: 4.8, // Pode ser calculado depois
        total_sales: 0, // Pode ser calculado depois
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at
      }));

      setSellers(mappedSellers);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast.error('Erro ao carregar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seller: SellerProfile) => {
    setEditingId(seller.id);
    setFormData({
      full_name: seller.full_name,
      business_name: seller.business_name || '',
      avatar_url: seller.avatar_url || '',
      address: seller.address || '',
      city: seller.city || '',
      state: seller.state || '',
      phone: seller.phone || '',
      email: seller.email || '',
      description: seller.description || '',
      rating: seller.rating,
      total_sales: seller.total_sales
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      business_name: '',
      avatar_url: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      description: '',
      rating: 4.8,
      total_sales: 0
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name) {
        toast.error('Nome é obrigatório');
        return;
      }

      if (editingId) {
        // Atualizar vendedor existente
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
            phone: formData.phone,
            email: formData.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Vendedor atualizado com sucesso!');
      }

      handleCancel();
      loadSellers();
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error);
      toast.error('Erro ao salvar vendedor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await appConfirm('Tem certeza que deseja excluir este vendedor?'))) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Vendedor excluído com sucesso!');
      loadSellers();
    } catch (error) {
      console.error('Erro ao excluir vendedor:', error);
      toast.error('Erro ao excluir vendedor');
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, avatar_url: url });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfis de Vendedores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie os perfis de vendedores e empresas
          </p>
        </div>

        {/* Formulário de Edição */}
        {editingId && (
          <Card>
            <CardHeader>
              <CardTitle>Editar Vendedor</CardTitle>
              <CardDescription>
                Atualize as informações do vendedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="URL da imagem do avatar"
                  />
                  {formData.avatar_url && (
                    <div className="mt-2">
                      <img
                        src={formData.avatar_url}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nome do vendedor"
                  />
                </div>

                <div>
                  <Label htmlFor="business_name">Nome da Empresa</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Nome da empresa (opcional)"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <MaskedInput mask="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição sobre o vendedor ou empresa"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Vendedores Cadastrados</CardTitle>
            <CardDescription>
              {sellers.length} vendedor(es) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum vendedor cadastrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {seller.avatar_url ? (
                        <img
                          src={seller.avatar_url}
                          alt={seller.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-100">
                          <Store className="h-8 w-8 text-orange-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {seller.business_name || seller.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {seller.city && seller.state ? `${seller.city}, ${seller.state}` : 'Localização não informada'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Membro desde {new Date(seller.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(seller)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(seller.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SellerProfiles;
