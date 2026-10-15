# Correção do Sistema de Notificações de Produtos

## Problema Identificado

O usuário vendedor estava recebendo a notificação errada:
- ❌ **Recebe:** "Novo produto aguardando aprovação... está aguardando sua aprovação"
- ✅ **Deveria receber:** "Seu produto foi aprovado!" (quando admin aprovar)

## Causa

O trigger `notify_admin_new_product` estava enviando notificações para **todos os usuários com role 'admin'**, mas se o próprio vendedor também fosse admin, ele recebia a notificação de "aguardando aprovação" do seu próprio produto.

## Solução Implementada

### 1. Corrigido o Trigger de Inserção
Agora o trigger **exclui o próprio vendedor** da lista de destinatários:
```sql
WHERE role = 'admin' AND user_id != NEW.user_id
```

### 2. Criado Novo Trigger de Aprovação/Rejeição
Quando o admin muda o `approval_status` do produto:

**Se aprovado (`pending` → `approved`):**
- 🔔 Vendedor recebe: "✅ Produto aprovado! Seu produto 'X' foi aprovado e já está disponível para venda!"

**Se rejeitado (`pending` → `rejected`):**
- 🔔 Vendedor recebe: "❌ Produto não aprovado. Seu produto 'X' não foi aprovado. Entre em contato com o suporte."

## Fluxo Correto de Notificações

### Quando Produto é Cadastrado:
1. Vendedor cadastra produto → `approval_status = 'pending'`
2. **Apenas admins** recebem notificação: "Novo produto aguardando aprovação"
3. Vendedor **NÃO recebe** nenhuma notificação neste momento

### Quando Admin Aprova:
1. Admin muda `approval_status` de `pending` para `approved`
2. **Apenas o vendedor** recebe notificação: "✅ Produto aprovado!"
3. Produto fica visível para todos

### Quando Admin Rejeita:
1. Admin muda `approval_status` de `pending` para `rejected`
2. **Apenas o vendedor** recebe notificação: "❌ Produto não aprovado"
3. Produto não fica visível

## Como Aplicar a Correção

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o SQL de: `supabase/migrations/20251014130000_fix_product_notifications.sql`
4. Execute

### Opção 2: Via Script Node.js

```bash
node apply-fix-notifications.cjs
```

## Tipos de Notificações Usadas

- `new_product_pending` → Para admins quando produto é cadastrado
- `product_approved` → Para vendedor quando produto é aprovado
- `product_rejected` → Para vendedor quando produto é rejeitado

## Testando as Correções

### Teste 1: Cadastro de Produto
1. Faça login como usuário comum (não admin)
2. Cadastre um produto
3. ✅ Verifique que você **NÃO recebe** notificação de "aguardando aprovação"
4. ✅ Faça login como admin e verifique que **admin recebe** a notificação

### Teste 2: Aprovação de Produto
1. Faça login como admin
2. Aprove um produto pendente
3. ✅ Faça login como o vendedor e verifique que recebeu notificação de "Produto aprovado!"

### Teste 3: Rejeição de Produto
1. Faça login como admin
2. Rejeite um produto pendente
3. ✅ Faça login como o vendedor e verifique que recebeu notificação de "Produto não aprovado"

## Observações Importantes

- As notificações antigas (já enviadas) não serão alteradas
- Apenas novos produtos e mudanças de status gerarão as notificações corretas
- Se um vendedor também for admin, ele **não receberá** a notificação de "aguardando aprovação" dos seus próprios produtos
- O vendedor sempre receberá notificação quando seu produto for aprovado ou rejeitado

## Interface de Administração

Para que os admins possam aprovar/rejeitar produtos, você precisará criar uma interface administrativa que:

1. Liste produtos com `approval_status = 'pending'`
2. Permita mudar o status para `approved` ou `rejected`
3. Exemplo de query:

```sql
-- Aprovar produto
UPDATE products 
SET approval_status = 'approved', status = 'active'
WHERE id = 'product_id';

-- Rejeitar produto
UPDATE products 
SET approval_status = 'rejected', status = 'inactive'
WHERE id = 'product_id';
```

## Próximos Passos Sugeridos

1. ✅ Aplicar a migração SQL
2. 🔨 Criar página de administração para aprovar/rejeitar produtos
3. 📧 Adicionar envio de email além da notificação in-app
4. 📝 Adicionar campo de "motivo da rejeição" para feedback ao vendedor
