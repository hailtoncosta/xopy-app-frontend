# 💳 Cartões de Teste - Mercado Pago

## 📋 Cartões para Teste

Use estes cartões para testar pagamentos no ambiente de teste do Mercado Pago:

### ✅ Cartão Aprovado

**Mastercard**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura (ex: `11/25`)
- Nome: Qualquer nome
- CPF: `12345678909`

**Visa**
- Número: `4235 6477 2802 5682`
- CVV: `123`
- Validade: Qualquer data futura
- Nome: Qualquer nome
- CPF: `12345678909`

### ❌ Cartão Recusado (Fundos Insuficientes)

**Mastercard**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Validade: Qualquer data futura
- Nome: Qualquer nome
- CPF: `12345678909`

### ⏳ Cartão Pendente

**Visa**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Validade: Qualquer data futura
- Nome: Qualquer nome
- CPF: `12345678909`

## 🧪 Como Testar

1. Acesse o checkout do produto
2. Selecione "Cartão" como forma de pagamento
3. Preencha os dados com um dos cartões acima
4. Clique em "Validar Cartão"
5. Após validação, clique em "Finalizar Pedido"

## 📝 Observações

- **CPF de Teste**: Use `12345678909` ou qualquer CPF válido
- **Validade**: Use qualquer data futura (ex: `11/25`, `12/26`)
- **CVV**: Use `123` para todos os cartões de teste
- **Nome**: Pode usar qualquer nome

## 🔗 Documentação Oficial

Para mais informações sobre cartões de teste:
https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

## ⚠️ Importante

- Estes cartões funcionam **APENAS** no ambiente de teste
- Nunca use cartões reais no ambiente de teste
- Para produção, você precisará usar as credenciais de produção do Mercado Pago
