import { MaskedInput } from '@/components/ui/masked-input';
import { User } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminProfile() {
  const { admin } = useAdminAuth();
  const { user, isLoading } = useAuth();
  const profile = user?.id === admin?.id ? user : null;
  return <AdminLayout title="Meu Perfil">
    <section className="max-w-3xl mx-auto rounded-xl border bg-white dark:bg-gray-800 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt="Foto do administrador" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center"><User className="w-8 h-8" /></div>}
        <div><h1 className="text-xl font-bold">Perfil do Administrador</h1><p className="text-sm text-gray-500">Dados da sua conta no painel.</p></div>
      </div>
      {isLoading ? <p role="status">Carregando perfil...</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ id: 'admin-name', label: 'Nome', value: profile?.name || admin?.user_metadata?.name || admin?.user_metadata?.full_name || '' }, { id: 'admin-email', label: 'E-mail', value: admin?.email || profile?.email || '' }, { id: 'admin-phone', label: 'Telefone', value: profile?.phone || '' }, { id: 'admin-role', label: 'Perfil de acesso', value: 'Administrador' }].map(field => <div key={field.id} className="min-w-0 space-y-2"><Label htmlFor={field.id}>{field.label}</Label>{field.id === 'admin-phone' ? <MaskedInput mask="phone" id={field.id} value={field.value} readOnly placeholder="Não informado" /> : <Input id={field.id} value={field.value} readOnly placeholder="Não informado" />}</div>)}
      </div>}
    </section>
  </AdminLayout>;
}
