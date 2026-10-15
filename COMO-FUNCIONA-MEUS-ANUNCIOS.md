# 📋 Como Funciona "Meus Anúncios"

## ✅ Salvamento de Dados no Banco

### Sim! Todos os dados são salvos no banco de dados Supabase

Quando o vendedor configura a loja em "Meus Anúncios", os dados são salvos na tabela `seller_stores`:

```sql
-- Estrutura da tabela
seller_stores (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,  -- ID do vendedor
  business_name VARCHAR(255),  -- Nome da empresa
  description TEXT,  -- Descrição da loja
  logo_url TEXT,  -- URL do logo no Supabase Storage
  address VARCHAR(255),  -- Endereço
  city VARCHAR(100),  -- Cidade
  state VARCHAR(2),  -- Estado (SP, RJ, etc)
  phone VARCHAR(20),  -- Telefone
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Fluxo de Salvamento:

1. **Vendedor preenche formulário** em "Meus Anúncios"
2. **Clica em "Salvar Configurações"**
3. **Sistema valida** os dados (nome obrigatório, limites de caracteres)
4. **Faz upload do logo** (se houver) para Supabase Storage
5. **Salva no banco** via `upsert` (cria ou atualiza)
6. **Mostra mensagem** de sucesso

### Quando o vendedor volta:

1. Sistema busca dados de `seller_stores` WHERE `user_id = vendedor`
2. Preenche automaticamente o formulário
3. Mostra logo salvo
4. Vendedor pode editar e salvar novamente

## 🔄 Edição de Dados

### O vendedor pode editar a qualquer momento:

1. Acessa "Meus Anúncios"
2. Vê formulário já preenchido com dados salvos
3. Modifica o que quiser
4. Clica em "Salvar Configurações"
5. Dados são atualizados no banco

### Campos editáveis:

- ✅ Nome da empresa
- ✅ Descrição
- ✅ Logo (pode trocar ou remover)
- ✅ Endereço
- ✅ Cidade
- ✅ Estado
- ✅ Telefone

## 🆕 Botão "Novo Produto"

### Agora conectado ao modal correto!

Quando o vendedor clica em **"Novo Produto"** (ou "Criar Primeiro Produto"):

1. **Abre o modal "Quero Vender"** (mesmo modal do perfil)
2. Vendedor preenche:
   - Título do produto
   - Descrição
   - Preço
   - Categoria
   - Fotos
   - Condição (novo/usado)
3. **Clica em "Publicar"**
4. Produto é salvo na tabela `products`
5. **Modal fecha**
6. **Lista de produtos atualiza automaticamente**
7. Novo produto aparece na lista

### Fluxo completo:

```
Meus Anúncios
    ↓
Clica "Novo Produto"
    ↓
Modal "Quero Vender" abre
    ↓
Preenche dados do produto
    ↓
Clica "Publicar"
    ↓
Produto salvo no banco
    ↓
Modal fecha
    ↓
Lista atualiza
    ↓
Produto aparece na lista
```

## 📊 Onde os Dados Ficam

### 1. Configuração da Loja
- **Tabela:** `seller_stores`
- **Dados:** nome, descrição, logo, endereço, etc.
- **Relação:** 1 loja por vendedor (UNIQUE em user_id)

### 2. Logo da Loja
- **Storage:** `product-images/store-logos/`
- **Formato:** `{user_id}-{timestamp}.{ext}`
- **Exemplo:** `abc123-1234567890.png`

### 3. Produtos
- **Tabela:** `products`
- **Dados:** título, preço, descrição, imagens, categoria, etc.
- **Relação:** N produtos por vendedor (user_id)

### 4. Estatísticas
- **Calculadas em tempo real:**
  - Total de produtos: COUNT de `products` WHERE user_id
  - Total de vendas: COUNT de `orders` WHERE seller_id
  - Avaliação média: Placeholder (4.8)

## 🔐 Segurança

### RLS (Row Level Security) ativado:

1. **Vendedor só vê sua própria loja**
   ```sql
   SELECT * FROM seller_stores WHERE user_id = auth.uid()
   ```

2. **Vendedor só edita sua própria loja**
   ```sql
   UPDATE seller_stores WHERE user_id = auth.uid()
   ```

3. **Todos podem ver lojas públicas** (para perfil)
   ```sql
   SELECT * FROM seller_stores -- sem filtro
   ```

4. **Vendedor só vê seus próprios produtos**
   ```sql
   SELECT * FROM products WHERE user_id = auth.uid()
   ```

## 🎯 Casos de Uso

### Caso 1: Vendedor novo
1. Acessa "Meus Anúncios" pela primeira vez
2. Vê formulário vazio
3. Preenche dados da loja
4. Faz upload do logo
5. Salva
6. Dados ficam salvos no banco

### Caso 2: Vendedor existente
1. Acessa "Meus Anúncios"
2. Vê formulário já preenchido
3. Pode editar qualquer campo
4. Salva novamente
5. Dados são atualizados no banco

### Caso 3: Criar produto
1. Clica "Novo Produto"
2. Modal abre
3. Preenche dados
4. Publica
5. Produto salvo no banco
6. Aparece na lista

### Caso 4: Editar produto
1. Clica "Editar" no card do produto
2. Modal/página de edição abre (a implementar)
3. Modifica dados
4. Salva
5. Produto atualizado no banco

### Caso 5: Ativar/Desativar produto
1. Clica no toggle do card
2. Status muda no banco
3. Produto some/aparece no marketplace
4. Feedback visual imediato

## 🧪 Como Testar

### Testar salvamento de loja:

1. Faça login
2. Acesse "Meus Anúncios"
3. Preencha nome da empresa: "Minha Loja Teste"
4. Adicione descrição
5. Faça upload de logo
6. Clique "Salvar Configurações"
7. **Recarregue a página** (F5)
8. ✅ Dados devem estar lá!

### Testar criação de produto:

1. Em "Meus Anúncios"
2. Clique "Novo Produto"
3. Modal "Quero Vender" abre
4. Preencha dados do produto
5. Clique "Publicar"
6. ✅ Produto aparece na lista!

### Testar edição de loja:

1. Acesse "Meus Anúncios"
2. Mude o nome da empresa
3. Clique "Salvar"
4. Recarregue
5. ✅ Nome atualizado!

### Verificar no banco (SQL):

```sql
-- Ver sua loja
SELECT * FROM seller_stores 
WHERE user_id = 'SEU_USER_ID';

-- Ver seus produtos
SELECT * FROM products 
WHERE user_id = 'SEU_USER_ID';

-- Ver estatísticas
SELECT 
  (SELECT COUNT(*) FROM products WHERE user_id = 'SEU_USER_ID' AND status = 'active') as produtos,
  (SELECT COUNT(*) FROM orders WHERE seller_id = 'SEU_USER_ID') as vendas;
```

## ❓ FAQ

### Os dados ficam salvos mesmo se eu fechar o navegador?
✅ **Sim!** Tudo é salvo no banco de dados Supabase.

### Posso editar minha loja depois?
✅ **Sim!** Basta acessar "Meus Anúncios" e editar.

### O logo fica salvo?
✅ **Sim!** No Supabase Storage, pasta `store-logos/`.

### Posso criar vários produtos?
✅ **Sim!** Sem limite.

### Os produtos aparecem no marketplace?
✅ **Sim!** Após aprovação (se houver moderação).

### Posso desativar um produto?
✅ **Sim!** Clique no toggle "Ativar/Desativar".

### O que acontece se eu desativar?
O produto some do marketplace mas continua na sua lista.

### Posso deletar um produto?
Não implementado ainda, mas pode desativar.

## 🚀 Próximos Passos

Funcionalidades que podem ser adicionadas:

1. ✅ Salvamento no banco (FEITO)
2. ✅ Edição de loja (FEITO)
3. ✅ Modal de criar produto (FEITO)
4. ⏭️ Página de edição de produto
5. ⏭️ Deletar produto
6. ⏭️ Duplicar produto
7. ⏭️ Estatísticas detalhadas
8. ⏭️ Gráficos de vendas
9. ⏭️ Notificações de novos pedidos
10. ⏭️ Chat com compradores

---

**Status:** ✅ **TUDO FUNCIONANDO!**

Os dados são salvos no banco, podem ser editados, e o botão "Novo Produto" abre o modal correto! 🎉
