# 🔍 Debug do Checkout - Guia de Verificação

## ⚠️ Problema Atual

Erro: `ERR_INTERNET_DISCONNECTED` ao tentar criar pedido

## 🔎 Passos para Debug

### 1. Verificar Conexão com Internet
- ✅ Verifique se sua internet está funcionando
- ✅ Tente acessar outros sites

### 2. Verificar Console do Navegador (F12)

Quando clicar em "Comprar Agora", você deve ver:

```
📦 Produto do localStorage: {...}
🔍 Tentando buscar produto com UUID: [ID]
✅ Produto encontrado no banco (products): {...}
👤 Seller ID: [UUID] User ID: [UUID] Is User Product: true
```

**Se aparecer:**
- ❌ `Produto não encontrado em products` → O produto não está no banco
- ❌ `Produto inválido` → O ID do produto está errado

### 3. Verificar se o Produto Existe no Banco

Abra o Supabase e verifique:

1. Vá em **Table Editor** → **products**
2. Procure pelo produto que você está tentando comprar
3. Verifique:
   - ✅ `id` (deve ser UUID, ex: `abc-123-def-456`)
   - ✅ `approval_status` = `'approved'`
   - ✅ `status` = `'active'`
   - ✅ `user_id` (UUID do vendedor)

### 4. Verificar ID do Produto

No console, quando clicar no produto, veja o ID:

**ID Correto (UUID)**:
```
id: "550e8400-e29b-41d4-a716-446655440000"
```

**ID Incorreto (Número)**:
```
id: 67
id: "67"
```

Se o ID for número, o produto **não está no banco**, é mockado.

## 🛠️ Soluções

### Solução 1: Produto Não Está no Banco

Se o produto não existe no banco:

1. Vá em `/admin/products/add`
2. Cadastre o produto
3. Aprove o produto
4. Tente comprar novamente

### Solução 2: Produto com ID Numérico

Se o produto tem ID numérico (mockado):

1. Abra `src/pages/ProductDetail.tsx`
2. Procure onde o produto é carregado
3. Verifique se está vindo do banco ou de dados estáticos

### Solução 3: Erro de Conexão

Se o erro é `ERR_INTERNET_DISCONNECTED`:

1. Verifique sua conexão com internet
2. Verifique se o Supabase está acessível
3. Tente recarregar a página

## 📝 Teste Rápido

Execute este teste no console do navegador (F12):

```javascript
// Verificar produto no localStorage
const checkoutItem = localStorage.getItem('xopy_checkout_item');
console.log('Produto no localStorage:', JSON.parse(checkoutItem));

// Verificar se é UUID válido
const product = JSON.parse(checkoutItem)[0];
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
console.log('É UUID válido?', isUUID);
console.log('ID do produto:', product.id);
```

## 🎯 Resultado Esperado

Quando tudo estiver correto, você deve ver:

```
✅ Produto encontrado no banco (products)
✅ Seller ID: [UUID válido]
✅ Criando pedido...
✅ Pedido criado com sucesso!
```

## 📞 Próximos Passos

1. Execute os testes acima
2. Me envie o resultado do console
3. Me diga qual solução se aplica ao seu caso
