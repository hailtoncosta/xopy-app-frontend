# 🧪 Guia de Teste - Mercado Pago

## ✅ Correções Aplicadas

1. **Renovar Token**: Agora só aparece quando o token foi conectado via OAuth (com refresh_token)
2. **Atualizar Token**: Permite reconectar/atualizar o token manualmente a qualquer momento
3. **Mensagens de erro**: Mais claras e específicas

## 📝 Como Testar

### Passo 1: Acessar Configurações
1. Faça login como admin
2. Vá em `/admin/settings`
3. Clique na aba **"Mercado Pago"**

### Passo 2: Conectar Conta de Teste

**Opção A: Via Access Token Manual (Recomendado para testes)**

1. Clique em **"Conectar Mercado Pago"**
2. Cole o Access Token de teste:
   ```
   TEST-1523898674931437-101510-8e79e01dbdd44758ae467c37a61d70ad-2695399049
   ```
3. Clique em **"Conectar"**
4. ✅ Deve aparecer: **"Mercado Pago conectado com sucesso!"**

**Opção B: Via OAuth (Para produção)**

1. Clique em **"Conectar via OAuth"** (se implementado)
2. Autorize no Mercado Pago
3. Será redirecionado de volta
4. ✅ Conta conectada

### Passo 3: Verificar Status

Após conectar, você deve ver:
- ✅ Badge verde "Conta conectada"
- 🆔 User ID do Mercado Pago
- 📅 Data de conexão
- 🔄 Botão **"Atualizar Token"** (sempre visível)
- 🔄 Botão **"Renovar Token"** (só se conectado via OAuth)

### Passo 4: Testar Atualizar Token

1. Clique em **"Atualizar Token"**
2. Cole um novo Access Token (pode ser o mesmo)
3. Clique em **"Conectar"**
4. ✅ Token deve ser atualizado

### Passo 5: Criar um Pagamento de Teste

Abra o console do navegador e execute:

```javascript
// Importar o serviço
import { createOrder } from '@/services/orderService';

// Criar pedido com pagamento PIX
const teste = await createOrder({
  product_id: 'uuid-de-um-produto-real', // Use um ID real
  seller_id: '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3', // Seu user_id
  total_amount: 100,
  marketplace_fee: 10,
  payment_method: 'pix',
  payer: {
    email: 'teste@teste.com',
    first_name: 'Teste',
    last_name: 'Silva'
  },
  product_info: {
    title: 'Produto de Teste',
    quantity: 1,
    unit_price: 100
  }
});

console.log('✅ Pedido criado:', teste.order);
console.log('💰 Pagamento:', teste.payment);
console.log('📱 QR Code PIX:', teste.payment.point_of_interaction?.transaction_data?.qr_code);
```

### Passo 6: Verificar QR Code PIX

Se tudo funcionou:
- ✅ Pedido criado na tabela `orders`
- ✅ Transação salva na tabela `mercado_pago_transactions`
- ✅ QR Code PIX gerado
- ✅ Split automático configurado (R$ 10 Xopy + R$ 90 Lojista)

## 🔍 Verificar no Banco de Dados

### Ver tokens conectados:
```sql
SELECT * FROM mercado_pago_tokens;
```

### Ver pedidos:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
```

### Ver transações:
```sql
SELECT * FROM mercado_pago_transactions ORDER BY created_at DESC LIMIT 5;
```

## 🐛 Troubleshooting

### ❌ "Edge Function returned a non-2xx status code"
**Causa**: Token inválido ou expirado
**Solução**: Clique em "Atualizar Token" e cole um token válido

### ❌ "Não é possível renovar"
**Causa**: Token foi salvo manualmente (sem refresh_token)
**Solução**: Use "Atualizar Token" para reconectar

### ❌ "Lojista não possui conta MP conectada"
**Causa**: Token não foi salvo corretamente
**Solução**: 
1. Verifique no banco: `SELECT * FROM mercado_pago_tokens WHERE lojista_id = 'seu-id'`
2. Reconecte usando "Atualizar Token"

### ❌ "Token inválido. Deve começar com TEST-"
**Causa**: Token incorreto ou incompleto
**Solução**: Copie o token completo do painel do MP

## 📊 Logs para Debug

### Ver logs das Edge Functions:
- [mp-create-payment](https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/functions/mp-create-payment/logs)
- [mp-save-token](https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/functions/mp-save-token/logs)
- [mp-refresh-token](https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/functions/mp-refresh-token/logs)
- [mp-oauth-callback](https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr/functions/mp-oauth-callback/logs)

## ✅ Checklist de Testes

- [ ] Conectar conta via Access Token manual
- [ ] Verificar status "conectado" na interface
- [ ] Ver User ID do MP na tela
- [ ] Clicar em "Atualizar Token" e reconectar
- [ ] Criar um pagamento de teste
- [ ] Verificar QR Code PIX gerado
- [ ] Verificar registro na tabela orders
- [ ] Verificar registro na tabela mercado_pago_transactions
- [ ] Verificar split de valores (marketplace_fee)

## 🎯 Resultado Esperado

Ao final dos testes, você deve ter:
1. ✅ Conta MP conectada e visível no painel
2. ✅ Capacidade de criar pagamentos
3. ✅ QR Codes PIX gerados corretamente
4. ✅ Split automático funcionando (Xopy + Lojista)
5. ✅ Registros corretos no banco de dados

## 📞 Próximos Passos

Após validar em teste:
1. Trocar credenciais de teste por produção
2. Testar com dinheiro real (valores pequenos)
3. Configurar webhooks para notificações automáticas
4. Implementar UI de checkout com QR Code
