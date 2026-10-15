# 🚀 Executar Migration - Seller Stores

## O que será criado

Esta migration cria a infraestrutura completa para o sistema de gerenciamento de lojas:

✅ Tabela `seller_stores` com todos os campos necessários
✅ Índices para performance em `seller_stores` e `products`
✅ RLS Policies para segurança
✅ Trigger para atualizar `updated_at` automaticamente
✅ Comentários e documentação

## Como executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase/migrations/create_seller_stores.sql`
6. Cole no editor
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Verifique se apareceu "Success. No rows returned"

### Opção 2: Via Supabase CLI

```bash
# Se você tem o Supabase CLI instalado
supabase db push
```

## Verificar se funcionou

Execute esta query no SQL Editor para verificar:

```sql
-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seller_stores'
ORDER BY ordinal_position;

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'seller_stores';

-- Verificar policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'seller_stores';
```

Você deve ver:
- ✅ 11 colunas na tabela seller_stores
- ✅ 2 índices (idx_seller_stores_user_id, idx_seller_stores_created_at)
- ✅ 4 policies de RLS

## Configurar Storage (Importante!)

O bucket `product-images` já existe no seu projeto. Os logos serão salvos lá com prefixo `store-logos/`.

**Não precisa criar novo bucket!** Vamos usar o bucket existente.

## Testar a tabela

Após executar a migration, teste inserindo um registro:

```sql
-- Inserir loja de teste (substitua USER_ID pelo seu UUID)
INSERT INTO seller_stores (
  user_id,
  business_name,
  description,
  city,
  state
) VALUES (
  'SEU_USER_ID_AQUI',
  'Minha Loja Teste',
  'Descrição da minha loja',
  'São Paulo',
  'SP'
);

-- Buscar lojas
SELECT * FROM seller_stores;

-- Deletar teste
DELETE FROM seller_stores WHERE business_name = 'Minha Loja Teste';
```

## Próximos passos

Após executar a migration com sucesso:

1. ✅ Infraestrutura criada
2. ⏭️ Próxima tarefa: Implementar service layer (Tarefa 2)

## Troubleshooting

### Erro: "relation already exists"
- A tabela já foi criada antes
- Pode pular esta migration ou fazer DROP TABLE primeiro

### Erro: "permission denied"
- Verifique se está usando o usuário correto no Supabase
- Tente via Dashboard ao invés de CLI

### Erro: "function uuid_generate_v4 does not exist"
- Execute antes: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## Rollback (se necessário)

Se precisar desfazer a migration:

```sql
-- Remover policies
DROP POLICY IF EXISTS "Vendedores podem ver sua própria loja" ON seller_stores;
DROP POLICY IF EXISTS "Vendedores podem criar sua loja" ON seller_stores;
DROP POLICY IF EXISTS "Vendedores podem atualizar sua loja" ON seller_stores;
DROP POLICY IF EXISTS "Todos podem ver lojas públicas" ON seller_stores;

-- Remover trigger e função
DROP TRIGGER IF EXISTS trigger_update_seller_stores_updated_at ON seller_stores;
DROP FUNCTION IF EXISTS update_seller_stores_updated_at();

-- Remover índices
DROP INDEX IF EXISTS idx_seller_stores_user_id;
DROP INDEX IF EXISTS idx_seller_stores_created_at;

-- Remover tabela
DROP TABLE IF EXISTS seller_stores;
```
