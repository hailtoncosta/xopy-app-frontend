# Correção de Erros no Modal de Venda de Produtos

## Problemas Identificados e Corrigidos

### 1. ❌ Erro: Botão dentro de Botão (React Warning)

**Problema:**
```
Warning: validateDOMNesting(...): <button> cannot appear as a descendant of <button>.
```

**Causa:**
No modal de venda, havia dois lugares onde um botão estava aninhado dentro de outro botão:
- Upload de logo da empresa (lojista)
- Upload de fotos do produto

**Solução:**
Substituí os elementos `<button>` externos por `<div>` com as mesmas classes e adicionei `cursor-pointer` para manter a interatividade.

**Arquivos Modificados:**
- `src/components/modals/SellProductModal.tsx`

---

### 2. ❌ Erro: Constraint de Notificações

**Problema:**
```
Erro ao cadastrar produto: Erro ao inserir produto: new row for relation "notifications" 
violates check constraint "notifications_type_check"
```

**Causa:**
Quando um produto é cadastrado, um trigger no banco de dados tenta criar uma notificação para os administradores com o tipo `'new_product_pending'`. No entanto, esse tipo não estava na lista de tipos permitidos pela constraint `notifications_type_check`.

**Solução:**
Criei uma nova migração que:
1. Adiciona a coluna `approval_status` à tabela `products` (necessária para o trigger funcionar)
2. Adiciona a coluna `images` à tabela `products` (para armazenar URLs das imagens)
3. Atualiza a constraint de notificações para incluir `'new_product_pending'`
4. Recria o trigger de notificação de produtos
5. Adiciona índice para melhor performance

**Arquivos Criados:**
- `supabase/migrations/20251014120000_fix_products_and_notifications.sql`
- `apply-fix-products-migration.cjs`

---

## Como Aplicar as Correções

### Passo 1: Correções no Frontend (Já Aplicadas)
As correções no arquivo `SellProductModal.tsx` já foram aplicadas automaticamente.

### Passo 2: Aplicar Migração no Banco de Dados

Execute o script de migração:

```bash
node apply-fix-products-migration.cjs
```

**OU** aplique manualmente a migração no Supabase Dashboard:
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Copie e cole o conteúdo de `supabase/migrations/20251014120000_fix_products_and_notifications.sql`
4. Execute o SQL

---

## Alterações na Estrutura do Banco de Dados

### Tabela `products`

**Novas Colunas:**
```sql
approval_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'))

images TEXT[]
```

**Novo Índice:**
```sql
idx_products_approval_status
```

### Tabela `notifications`

**Constraint Atualizada:**
Agora aceita os seguintes tipos:
- `new_message`
- `conversation_started`
- `conversation_closed`
- `new_product_pending` ✨ (NOVO)
- `new_service_provider`
- `new_rental_inquiry`
- `new_user_registered`
- `product_approved`
- `product_rejected`
- `service_provider_approved`
- `service_provider_rejected`

---

## Fluxo de Aprovação de Produtos

Com as correções aplicadas, o fluxo agora funciona assim:

1. **Usuário cadastra produto** → Status inicial: `approval_status = 'pending'`
2. **Trigger é acionado** → Cria notificação para todos os administradores
3. **Admin recebe notificação** → Tipo: `'new_product_pending'`
4. **Admin aprova/rejeita** → Atualiza `approval_status` para `'approved'` ou `'rejected'`
5. **Produto aprovado** → Fica visível para todos os usuários

---

## Testes Recomendados

Após aplicar as correções, teste:

1. ✅ Cadastro de produto como **Pessoa Física**
2. ✅ Cadastro de produto como **Lojista** (com upload de logo)
3. ✅ Upload de múltiplas fotos do produto
4. ✅ Verificar se notificações são criadas para admins
5. ✅ Verificar se não há mais warnings no console do navegador

---

## Observações Importantes

- Os produtos existentes serão automaticamente marcados como `approved` se tiverem `status = 'active'`
- O trigger só cria notificações para produtos com `approval_status = 'pending'`
- As imagens são armazenadas no bucket `product-images` do Supabase Storage
- As logos são armazenadas no bucket `store-logos` do Supabase Storage

---

## Próximos Passos (Opcional)

Para melhorar ainda mais o sistema, considere:

1. Criar interface de administração para aprovar/rejeitar produtos
2. Adicionar notificações para o vendedor quando produto for aprovado/rejeitado
3. Implementar sistema de moderação de imagens
4. Adicionar validação de documentos (CPF/CNPJ)
