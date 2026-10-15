# 🚀 Guia Rápido de Teste - Pagamento com Cartão

## ⚠️ IMPORTANTE - ATUALIZAÇÃO APLICADA

A rota `/checkout` agora usa o **CheckoutNew** com suporte a cartão de crédito!

**CORREÇÃO APLICADA**: Agora funciona com produtos mockados e produtos do banco!

## ✅ Pré-requisitos

1. ✅ Servidor rodando (`npm run dev`)
2. ✅ **Recarregue a página** (Ctrl+Shift+R) para limpar o cache
3. ⚠️ Produtos mockados funcionam para teste (não precisa ter no banco)

## 🧪 Teste Rápido (5 minutos)

### 1. Acesse um Produto
```
http://localhost:8080
```
- Clique em qualquer produto
- Clique em "Comprar Agora"

### 2. No Checkout
- Selecione **"Cartão"** como forma de pagamento

### 3. Preencha os Dados do Cartão

**Use este cartão de teste (aprovado)**:
```
Número do Cartão: 5031 4332 1540 6351
Validade: 11/25
CVV: 123
Nome no Cartão: APRO
CPF do Titular: 12345678909
```

### 4. Valide o Cartão
- Clique em **"Validar Cartão"**
- Aguarde alguns segundos
- O botão deve ficar verde com ✓ "Cartão Validado"

### 5. Finalize o Pedido
- Clique em **"Finalizar Pedido"**
- Aguarde o processamento
- Você verá a tela de sucesso ✅

## 🎯 Outros Cenários de Teste

### Teste de Cartão Recusado
```
Número: 5031 7557 3453 0604
Validade: 11/25
CVV: 123
Nome: OTHE
CPF: 12345678909
```
**Resultado esperado**: Erro de fundos insuficientes

### Teste de Cartão Pendente
```
Número: 4509 9535 6623 3704
Validade: 11/25
CVV: 123
Nome: CALL
CPF: 12345678909
```
**Resultado esperado**: Pagamento fica pendente

## 🔍 Verificar Resultado

### No Console do Navegador (F12)
Você verá logs como:
```
Criando pedido: {...}
Pedido criado: {...}
Pagamento criado: {...}
```

### No Banco de Dados (Supabase)
Verifique as tabelas:
- `orders` - Pedido criado
- `mercado_pago_transactions` - Transação registrada

### No Mercado Pago
Acesse: https://www.mercadopago.com.br/developers/panel/app
- Vá em "Atividade de teste"
- Veja o pagamento processado

## ❌ Problemas Comuns

### "Vendedor não possui conta MP conectada"
**Solução**: Conecte a conta MP em `/admin/settings` → aba "Mercado Pago"

### "Por favor, valide os dados do cartão primeiro"
**Solução**: Clique em "Validar Cartão" antes de finalizar

### "SDK do Mercado Pago não carregado"
**Solução**: Aguarde alguns segundos e tente novamente

### Erro de CORS
**Solução**: Verifique se as Edge Functions estão deployadas no Supabase

## 📊 Checklist de Teste

- [ ] PIX funciona
- [ ] Cartão aprovado funciona
- [ ] Cartão recusado mostra erro
- [ ] Validação de campos funciona
- [ ] Formatação automática funciona
- [ ] Tela de sucesso aparece
- [ ] Pedido é salvo no banco
- [ ] Transação é registrada

## 🎉 Sucesso!

Se todos os testes passaram, o pagamento com cartão está funcionando perfeitamente!

## 📞 Suporte

Dúvidas? Consulte:
- `IMPLEMENTACAO_CARTAO_CREDITO.md` - Detalhes técnicos
- `CARTOES_TESTE_MERCADO_PAGO.md` - Lista completa de cartões
- `INTEGRACAO_MERCADO_PAGO.md` - Documentação geral
