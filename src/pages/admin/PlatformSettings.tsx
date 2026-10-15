import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { platformSettingsService } from '@/services/platformSettingsService';
import { Loader2, Save, Percent, TrendingUp, DollarSign } from 'lucide-react';

export default function PlatformSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: authLoading } = useIsAdmin();
  
  const [commissionRate, setCommissionRate] = useState<string>('5.00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await platformSettingsService.getSettings();
      if (settings) {
        setCommissionRate(settings.commission_rate.toFixed(2));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as configurações'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const rate = parseFloat(commissionRate);
      
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast({
          variant: 'destructive',
          title: 'Erro de validação',
          description: 'A taxa deve ser um número entre 0 e 100'
        });
        return;
      }

      const result = await platformSettingsService.updateCommissionRate(rate);

      if (result.success) {
        toast({
          title: '✅ Taxa atualizada!',
          description: `A taxa de comissão foi alterada para ${rate.toFixed(2)}%`
        });
        loadSettings();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: result.error || 'Não foi possível atualizar a taxa'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as configurações'
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateExampleFee = (amount: number) => {
    const rate = parseFloat(commissionRate) || 0;
    return (amount * rate) / 100;
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações gerais do marketplace Xopy
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Configuração da Taxa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Taxa de Comissão
              </CardTitle>
              <CardDescription>
                Defina o percentual cobrado em cada venda realizada na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Taxa de Comissão (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="flex-1"
                    placeholder="5.00"
                  />
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Valor entre 0% e 100%. Decimal com até 2 casas (ex: 5.50)
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Taxa Atual:</p>
                <p className="text-2xl font-bold text-primary">
                  {parseFloat(commissionRate).toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card de Exemplos de Cálculo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Simulação de Comissão
              </CardTitle>
              <CardDescription>
                Veja quanto será cobrado em diferentes valores de venda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[100, 500, 1000, 5000].map((amount) => {
                  const fee = calculateExampleFee(amount);
                  const seller = amount - fee;
                  
                  return (
                    <div key={amount} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Venda de</p>
                          <p className="font-semibold">R$ {amount.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comissão Xopy:</span>
                          <span className="font-medium text-primary">R$ {fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vendedor recebe:</span>
                          <span className="font-medium">R$ {seller.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Importantes */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">⚠️ Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-900">
            <p>
              • A taxa configurada será aplicada <strong>automaticamente</strong> em todas as novas transações via Mercado Pago.
            </p>
            <p>
              • O valor da comissão é calculado sobre o total da venda e descontado antes do repasse ao vendedor.
            </p>
            <p>
              • Transações já realizadas não serão afetadas pela alteração da taxa.
            </p>
            <p>
              • A taxa é aplicada através do campo <code className="bg-yellow-100 px-1 rounded">application_fee</code> do Mercado Pago.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
