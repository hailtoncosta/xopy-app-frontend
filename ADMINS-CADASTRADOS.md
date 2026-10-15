# Usuários Administradores do Sistema

## 👥 Admins Cadastrados

De acordo com a migração `20251004163553_d020a537-d4c8-44b4-8f7d-1fe437e548cb.sql`, os seguintes usuários são automaticamente definidos como administradores:

### 1. **admin@pedreiro.com**
- Email de admin padrão do sistema
- Acesso completo ao painel administrativo

### 2. **enoquesanbor@gmail.com**
- Email do desenvolvedor/proprietário
- Acesso completo ao painel administrativo

### 3. **admin@example.com**
- Email de admin de exemplo/teste
- Acesso completo ao painel administrativo

---

## 🔐 Como Funciona o Sistema de Admin

### Autenticação
O sistema usa o contexto `AdminAuthContext` que:
1. Verifica se o usuário está autenticado no Supabase
2. Chama a função RPC `is_admin()` para verificar se tem role de admin
3. Permite acesso ao painel apenas se ambas as condições forem verdadeiras

### Tabela user_roles
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role public.app_role NOT NULL,  -- 'admin', 'moderator', 'user', 'service_provider'
  granted_at TIMESTAMP,
  granted_by UUID
);
```

### Função is_admin()
```sql
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
AS $
  SELECT public.has_role(auth.uid(), 'admin')
$;
```

---

## 🚀 Como Acessar o Painel Admin

### 1. Fazer Login
- Acesse: `/admin/login`
- Use um dos emails admin listados acima
- A senha é a que foi definida no cadastro do usuário

### 2. Rotas Protegidas
Todas as rotas `/admin/*` são protegidas e requerem:
- ✅ Usuário autenticado
- ✅ Role de admin na tabela `user_roles`

### 3. Páginas Administrativas Disponíveis
- `/admin` - Dashboard principal
- `/admin/products` - Gerenciar produtos
- `/admin/service-providers` - Gerenciar prestadores de serviço
- `/admin/rental-companies` - Gerenciar empresas de locação
- `/admin/seller-profiles` - Gerenciar perfis de vendedores
- `/admin/section-manager` - Gerenciar seções dinâmicas

---

## ➕ Como Adicionar um Novo Admin

### Opção 1: Via SQL (Supabase Dashboard)

```sql
-- Primeiro, encontre o user_id do usuário
SELECT id, email FROM auth.users WHERE email = 'novo-admin@exemplo.com';

-- Depois, adicione a role de admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-id-aqui', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Opção 2: Via Script Node.js

```bash
node add-admin-user.cjs novo-admin@exemplo.com
```

**Nota:** O usuário precisa estar cadastrado no sistema antes de receber a role de admin.

---

## 🔧 Troubleshooting

### Problema: "Não consigo acessar o painel admin"

**Verificações:**
1. ✅ O usuário está cadastrado no sistema?
2. ✅ O email está correto (um dos 3 listados acima)?
3. ✅ A senha está correta?
4. ✅ A migração que cria os admins foi executada?

**Solução:**
Execute a migração manualmente no Supabase Dashboard:

```sql
-- Adicionar role de admin para os emails padrão
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('admin@pedreiro.com', 'enoquesanbor@gmail.com', 'admin@example.com')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Problema: "Erro de recursão infinita ao verificar admin"

Isso acontece quando as políticas RLS da tabela `user_roles` tentam verificar se o usuário é admin para permitir acesso, mas para verificar isso precisam acessar a própria tabela.

**Solução:** As funções `is_admin()` e `has_role()` são criadas com `SECURITY DEFINER` para evitar esse problema.

---

## 📊 Permissões de Admin

Admins têm acesso completo a:

### Produtos
- ✅ Ver todos os produtos (incluindo pendentes)
- ✅ Aprovar/rejeitar produtos
- ✅ Editar qualquer produto
- ✅ Deletar produtos

### Prestadores de Serviço
- ✅ Ver todos os prestadores (incluindo pendentes)
- ✅ Aprovar/rejeitar prestadores
- ✅ Editar perfis de prestadores
- ✅ Desativar prestadores

### Empresas de Locação
- ✅ Ver todas as empresas
- ✅ Gerenciar equipamentos
- ✅ Ver solicitações de aluguel

### Notificações
- ✅ Receber notificações de:
  - Novos produtos pendentes
  - Novos prestadores de serviço
  - Novas solicitações de aluguel
  - Novos usuários registrados

### Configurações
- ✅ Gerenciar configurações do sistema
- ✅ Gerenciar seções dinâmicas
- ✅ Gerenciar banners e promoções

---

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas sensíveis têm RLS habilitado:
- `user_roles` - Apenas admins podem gerenciar roles
- `products` - Usuários veem apenas produtos ativos ou seus próprios
- `service_providers` - Usuários veem apenas prestadores aprovados
- `admin_settings` - Apenas admins podem ler/modificar

### Funções SECURITY DEFINER
As funções `is_admin()` e `has_role()` são criadas com `SECURITY DEFINER` para:
- Evitar recursão infinita nas políticas RLS
- Garantir verificação consistente de permissões
- Melhorar performance

---

## 📝 Logs e Auditoria

A tabela `user_roles` registra:
- `granted_at` - Quando a role foi concedida
- `granted_by` - Quem concedeu a role (se aplicável)

Isso permite rastrear quando e por quem as permissões foram concedidas.

---

## 🆘 Suporte

Se você perdeu o acesso admin ou precisa adicionar um novo admin:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute o SQL para adicionar admin (veja seção "Como Adicionar um Novo Admin")
4. Faça logout e login novamente

**Importante:** Sempre mantenha pelo menos um usuário com role de admin ativo no sistema!
