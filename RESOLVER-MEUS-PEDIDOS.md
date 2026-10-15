# 🔧 Resolver Erro "Meus Pedidos"

## ❌ Problema

Ao acessar "Meus Pedidos" no perfil, aparece: **"Erro ao carregar pedidos"**

---

## 🔍 Possíveis Causas

1. **Políticas RLS** bloqueando leitura de pedidos
2. **Query complexa** com JOINs que não funcionam
3. **Permissões** insuficientes

---

## ✅ Solução 1: Atualizar Código (JÁ FEITO)

O código foi atualizado para:
- ✅ Simplificar a query (sem JOINs complexos)
- ✅ Buscar produtos separadamente
- ✅ Melhor tratamento de erros
- ✅ Logs detalhados

---

## ✅ Solução 2: Ajustar Políticas RLS

### Execute no Supabase SQL Editor:

**Arquivo:** `CORRIGIR-MEUS-PEDIDOS.sql`

```
1. Supabase → SQL Editor
2. New Query
3. Cole o conteúdo de CORRIGIR-MEUS-PEDIDOS.sql
4. Run
```

**O que o script faz:**
1. ✅ Verifica se há pedidos na tabela
2. ✅ Mostra últimos 5 pedidos
3. ✅ Cria política RLS para SELECT
4. ✅ Testa se você pode ver seus pedidos

**Resultado esperado:**
```
✅ Usuário tem X pedido(s)
✅ A consulta deve funcionar no app
```

---

## 🧪 Testar Agora

### 1. Verificar no Supabase

```
Supabase → Table Editor → orders
```

Deve ver seus pedidos criados.

### 2. Testar no App

1. Acesse o perfil
2. Clique em "Meus Pedidos"
3. ✅ Deve mostrar lista de pedidos
4. ✅ Cada pedido com informações do produto

---

## 📊 O Que Mudou no Código

### ANTES:
```typescript
// Query complexa com JOINs
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    product:products(id, title, price, category),
    buyer:auth.users!orders_buyer_id_fkey(id, email),
    seller:auth.users!orders_seller_id_fkey(id, email)
  `)
  .eq(column, user.id);
```

**Problema:** JOINs com `auth.users` podem falhar

### DEPOIS:
```typescript
// 1. Buscar pedidos simples
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq(column, user.id);

// 2. Buscar produtos separadamente
const ordersWithProducts = await Promise.all(
  orders.map(async (order) => {
    const { data: product } = await supabase
      .from('products')
      .select('id, title, price, category, images')
      .eq('id', order.product_id)
      .single();
    
    return { ...order, product };
  })
);
```

**Vantagens:**
- ✅ Mais simples e confiável
- ✅ Não depende de JOINs complexos
- ✅ Melhor tratamento de erros

---

## 🔍 Logs no Console

Agora você verá logs detalhados:

```javascript
🔍 Buscando pedidos: {
  userId: "91057d9a-...",
  type: "buyer",
  column: "buyer_id"
}

✅ Pedidos encontrados: 2
```

Se der erro:
```javascript
❌ Erro ao buscar pedidos: { message: "..." }
```

---

## 🆘 Se Ainda Der Erro

### Erro: "new row violates row-level security policy"

**Solução:** Execute `CORRIGIR-MEUS-PEDIDOS.sql`

### Erro: "Nenhum pedido encontrado"

**Possíveis causas:**
1. Você ainda não fez nenhuma compra
2. Os pedidos foram criados com outro `buyer_id`

**Verificar:**
```sql
-- Ver todos os pedidos
SELECT * FROM orders;

-- Ver pedidos do seu usuário
SELECT * FROM orders 
WHERE buyer_id = 'SEU_UUID_AQUI';
```

### Erro: "Erro ao buscar produto do pedido"

**Causa:** Produto foi deletado ou não existe

**Solução:** O código agora trata isso e mostra `product: null`

---

## ✅ Checklist

- [ ] Executei `CORRIGIR-MEUS-PEDIDOS.sql`
- [ ] Vi mensagem: "Usuário tem X pedido(s)"
- [ ] Verifiquei pedidos no Supabase Table Editor
- [ ] Acessei "Meus Pedidos" no app
- [ ] ✅ Lista de pedidos aparece

---

## 🎯 Resultado Esperado

### Na página "Meus Pedidos":

```
📦 Meus Pedidos

┌─────────────────────────────────────┐
│ Pedido #a1b2c3d4                    │
│ Produto: Tintas                     │
│ Valor: R$ 75,40                     │
│ Status: Pendente                    │
│ Data: 16/10/2025                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Pedido #b2c3d4e5                    │
│ Produto: Rolo Pintura               │
│ Valor: R$ 28,90                     │
│ Status: Pendente                    │
│ Data: 16/10/2025                    │
└─────────────────────────────────────┘
```

---

## 📁 Arquivos Criados

1. ✅ `CORRIGIR-MEUS-PEDIDOS.sql` - Script para ajustar RLS
2. ✅ `RESOLVER-MEUS-PEDIDOS.md` - Este guia
3. ✅ `src/services/orderService.ts` - Código atualizado

---

**Execute `CORRIGIR-MEUS-PEDIDOS.sql` agora!** 🚀
