# 🔧 Resolver Erro "Failed to fetch" - Solução Final

## ❌ Erro Persistente

```
TypeError: Failed to fetch
Error: Usuário não autenticado
```

---

## 🔍 Possíveis Causas

1. **Políticas RLS (Row Level Security)** bloqueando inserção em `orders`
2. **Problema de CORS** ao acessar Supabase
3. **Sessão expirada** no navegador
4. **Problema de rede** temporário

---

## ✅ Solução 1: Verificar e Ajustar Políticas RLS

### Execute no Supabase SQL Editor:

**Arquivo:** `VERIFICAR-PERMISSOES-ORDERS.sql`

```
Supabase → SQL Editor → New Query → Cole o script → Run
```

**O que o script faz:**
1. ✅ Verifica se RLS está habilitado
2. ✅ Mostra políticas existentes
3. ✅ Cria políticas permissivas para usuários autenticados
4. ✅ Testa se você pode inserir pedidos

**Resultado esperado:**
```
✅ Inserção bem-sucedida!
   As políticas RLS estão funcionando corretamente
```

---

## ✅ Solução 2: Limpar Cache e Relogar

### Passo a Passo:

1. **Abra o DevTools** (F12)
2. **Vá em Application** (ou Aplicativo)
3. **Clique em "Clear storage"** (Limpar armazenamento)
4. **Marque tudo** e clique em "Clear site data"
5. **Recarregue a página** (F5)
6. **Faça login novamente**
7. **Tente comprar novamente**

---

## ✅ Solução 3: Testar em Modo Anônimo

1. Abra uma **janela anônima/privada**
2. Acesse o site
3. Faça login
4. Tente comprar um produto

Se funcionar em modo anônimo:
- ✅ O problema é cache/cookies
- ✅ Limpe o cache do navegador normal

---

## ✅ Solução 4: Verificar Console do Navegador

### Abra o Console (F12) e procure por:

```javascript
// Logs que devem aparecer:
🚀 Iniciando finalização de compra...
📊 Estado atual: { productData: true, sellerData: true, userData: true }
✅ Usando dados do usuário: 91057d9a-...
🔍 Tipo de produto: { isSystemProduct: true }
🏪 Produto do sistema - criando pedido sem Mercado Pago
```

### Se aparecer:
```
❌ Dados incompletos
```
**Problema:** O state não foi carregado corretamente  
**Solução:** Recarregue a página antes de comprar

### Se aparecer:
```
❌ Erro ao criar pedido: new row violates row-level security policy
```
**Problema:** Políticas RLS bloqueando  
**Solução:** Execute `VERIFICAR-PERMISSOES-ORDERS.sql`

---

## ✅ Solução 5: Desabilitar RLS Temporariamente (Apenas para Teste)

**⚠️ ATENÇÃO: Use apenas em ambiente de desenvolvimento!**

```sql
-- Desabilitar RLS na tabela orders
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

Depois de testar, **reabilite**:
```sql
-- Reabilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 Teste Passo a Passo

### 1. Verificar Autenticação

No console do navegador (F12), execute:
```javascript
const { data, error } = await supabase.auth.getUser();
console.log('User:', data.user);
console.log('Error:', error);
```

**Resultado esperado:**
```
User: { id: "91057d9a-...", email: "..." }
Error: null
```

### 2. Verificar Produto

```javascript
console.log('Product Data:', productData);
console.log('Seller Data:', sellerData);
console.log('User Data:', userData);
```

**Todos devem ter valores**, não `null` ou `undefined`.

### 3. Tentar Inserir Manualmente

No Supabase SQL Editor:
```sql
INSERT INTO orders (
    buyer_id,
    seller_id,
    product_id,
    total_amount,
    marketplace_fee,
    seller_amount,
    shipping_cost,
    payment_method,
    status
) VALUES (
    '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3', -- Seu UUID
    '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3', -- Seu UUID
    (SELECT id FROM products LIMIT 1), -- Qualquer produto
    100.00,
    10.00,
    90.00,
    0,
    'credit_card',
    'pending'
);
```

**Se der erro:**
- ❌ Problema de permissões RLS
- ✅ Execute `VERIFICAR-PERMISSOES-ORDERS.sql`

**Se funcionar:**
- ✅ Permissões OK
- ❌ Problema no código frontend

---

## 📊 Checklist de Diagnóstico

- [ ] Executei `VERIFICAR-PERMISSOES-ORDERS.sql`
- [ ] Vi mensagem: "Inserção bem-sucedida"
- [ ] Limpei cache do navegador
- [ ] Fiz logout e login novamente
- [ ] Testei em modo anônimo
- [ ] Verifiquei logs no console (F12)
- [ ] Testei inserção manual no SQL Editor
- [ ] Verifiquei que `userData` não é `null`

---

## 🎯 Resultado Esperado

Após executar as soluções:

1. ✅ Políticas RLS configuradas corretamente
2. ✅ Cache limpo
3. ✅ Sessão válida
4. ✅ Checkout funciona
5. ✅ Pedido criado com sucesso

---

## 🆘 Se Nada Funcionar

### Última Solução: Criar Pedido Mockado

Temporariamente, podemos criar um pedido "fake" apenas para testar o fluxo:

```typescript
// Em CheckoutNew.tsx, substitua a criação do pedido por:
if (isSystemProduct) {
  console.log('🏪 Criando pedido mockado para teste');
  
  // Simular pedido criado
  const mockOrder = {
    id: crypto.randomUUID(),
    buyer_id: userData.id,
    seller_id: sellerData.id,
    product_id: productData.id,
    total_amount: productData.price,
    status: 'pending',
  };
  
  console.log('✅ Pedido mockado:', mockOrder);
  toast.success('Pedido criado com sucesso! (Modo de teste)');
  setPaymentCreated(true);
  localStorage.removeItem('xopy_checkout_item');
  setIsProcessing(false);
  return;
}
```

---

## 📁 Arquivos Criados

1. ✅ `VERIFICAR-PERMISSOES-ORDERS.sql` - Verificar e ajustar RLS
2. ✅ `RESOLVER-ERRO-FINAL.md` - Este guia

---

**Execute `VERIFICAR-PERMISSOES-ORDERS.sql` primeiro!** 🚀  
Esse é o problema mais provável.
