# Pedidos Reais no Painel Admin

## Problema
A página de "Gerenciamento de Pedidos" no painel admin estava mostrando apenas dados mockados (falsos), não os pedidos reais feitos pelos usuários no app.

## Solução Implementada

### 1. Conexão com Banco de Dados
Adicionado carregamento de pedidos reais da tabela `orders`:

```typescript
const loadOrders = async () => {
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:buyer_id(id, email),
      seller:seller_id(id, email),
      product:product_id(id, title, price, images)
    `)
    .order('created_at', { ascending: false });
  
  // Converter para formato esperado
  const convertedOrders = ordersData.map(order => ({
    // ... conversão de dados
  }));
  
  setOrders(convertedOrders);
};
```

### 2. Conversão de Dados
Os pedidos do banco são convertidos para o formato esperado pela interface:

**Mapeamento de Status:**
- `approved` → `paid` (Pagamento)
- `pending` → `pending`
- `rejected` → `failed`

**Mapeamento de Métodos de Pagamento:**
- `pix` → `PIX`
- `credit_card` → `Cartão de Crédito`

**Dados do Cliente:**
- Nome extraído do email (antes do @)
- Email do comprador
- Telefone placeholder (pode ser adicionado depois)

**Dados do Produto:**
- Nome do produto
- Imagem do produto (primeira do array)
- Preço unitário
- Total do pedido

### 3. Atualização de Status
Função de atualização agora salva no banco de dados:

```typescript
const handleUpdateOrderStatus = async () => {
  await supabase
    .from('orders')
    .update({
      status: newStatus,
      tracking_code: newTrackingCode || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', selectedOrder.id);
  
  // Recarregar pedidos
  await loadOrders();
};
```

### 4. Indicador de Carregamento
Adicionado loading state enquanto busca os pedidos:

```tsx
{isLoading ? (
  <div className="text-center py-12">
    <div className="animate-spin..."></div>
    <p>Carregando pedidos...</p>
  </div>
) : filteredOrders.length === 0 ? (
  <div>Nenhum pedido encontrado</div>
) : (
  <table>...</table>
)}
```

---

## Estrutura de Dados

### Pedido no Banco (`orders`)
```typescript
{
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  total_amount: number;
  marketplace_fee: number;
  seller_amount: number;
  shipping_cost: number;
  payment_method: 'pix' | 'credit_card';
  payment_status: 'pending' | 'approved' | 'rejected';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Pedido na Interface (`Order`)
```typescript
{
  id: string;
  orderNumber: string; // PED-{ID}
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
  trackingCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Fluxo Completo

### 1. Usuário Faz Pedido
```
1. Usuário seleciona produto
2. Clica em "Comprar Agora"
3. Preenche dados no checkout
4. Finaliza pagamento (PIX ou Cartão)
5. Pedido é salvo na tabela orders
```

### 2. Pedido Aparece no Admin
```
1. Admin acessa "Gerenciamento de Pedidos"
2. Sistema busca pedidos da tabela orders
3. Pedidos são convertidos para formato da interface
4. Lista é exibida com todos os pedidos reais
```

### 3. Admin Atualiza Status
```
1. Admin clica em "Alterar status"
2. Seleciona novo status
3. Adiciona código de rastreamento (opcional)
4. Salva alterações
5. Status é atualizado no banco
6. Lista é recarregada
```

### 4. Usuário Vê Atualização
```
1. Usuário acessa "Meus Pedidos"
2. Vê status atualizado
3. Vê código de rastreamento (se adicionado)
```

---

## Estatísticas

As estatísticas no topo da página são calculadas em tempo real:

- **Total de Pedidos:** Conta todos os pedidos
- **Pedidos Pendentes:** Filtra por `status === 'pending'`
- **Receita Total:** Soma `total` de pedidos com `paymentStatus === 'paid'`

---

## Filtros Funcionais

Todos os filtros funcionam com os dados reais:

- **Busca:** Por número do pedido, nome do cliente, email, código de rastreamento
- **Status:** Pendente, Confirmado, Processando, Enviado, Entregue, Cancelado
- **Pagamento:** Pendente, Pago, Falhou, Reembolsado
- **Data:** Hoje, Última Semana, Último Mês

---

## Melhorias Futuras

### 1. Endereço de Entrega
Atualmente usa placeholder. Pode ser integrado com a tabela `user_addresses`:

```typescript
// Buscar endereço do pedido
const { data: address } = await supabase
  .from('user_addresses')
  .select('*')
  .eq('user_id', order.buyer_id)
  .eq('is_default', true)
  .single();
```

### 2. Telefone do Cliente
Adicionar campo `phone` na tabela `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN phone TEXT;
```

### 3. Múltiplos Itens por Pedido
Criar tabela `order_items` para suportar vários produtos por pedido:

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);
```

### 4. Notificações
Enviar notificação ao usuário quando status mudar:

```typescript
// Após atualizar status
await supabase
  .from('notifications')
  .insert({
    user_id: order.buyer_id,
    type: 'order_status_changed',
    title: 'Status do Pedido Atualizado',
    message: `Seu pedido ${order.orderNumber} foi ${newStatus}`,
    data: { order_id: order.id }
  });
```

---

## Arquivos Modificados

- ✅ `src/pages/admin/OrdersAdmin.tsx`
  - Adicionado import do supabase
  - Adicionado estado `isLoading`
  - Adicionada função `loadOrders()`
  - Atualizada função `handleUpdateOrderStatus()`
  - Adicionado indicador de carregamento
  - Removidos dados mockados

---

## Como Testar

### 1. Fazer um Pedido
1. Acesse o app como usuário
2. Selecione um produto
3. Clique em "Comprar Agora"
4. Finalize o pagamento

### 2. Verificar no Admin
1. Acesse o painel admin
2. Vá em "Gerenciamento de Pedidos"
3. ✅ Verifique que o pedido aparece na lista
4. ✅ Verifique que os dados estão corretos

### 3. Atualizar Status
1. Clique no ícone de editar
2. Selecione novo status
3. Adicione código de rastreamento
4. Salve
5. ✅ Verifique que o status foi atualizado

### 4. Verificar no App
1. Volte para o app como usuário
2. Vá em "Meus Pedidos"
3. ✅ Verifique que o status está atualizado

---

## Resultado Final

Agora o painel admin mostra:
- ✅ Pedidos reais do banco de dados
- ✅ Dados corretos dos clientes
- ✅ Imagens dos produtos
- ✅ Status atualizáveis
- ✅ Estatísticas em tempo real
- ✅ Filtros funcionais
- ✅ Sincronização com "Meus Pedidos" do usuário
