# 🔧 Corrigir Preços dos Produtos

## ❌ Problema

Na página principal, os produtos mostram o preço correto (ex: R$ 49,90), mas ao clicar no produto, na página de detalhes o preço muda para **R$ 0,01**.

---

## 🔍 Causa

Durante a migração, alguns produtos ficaram com preço R$ 0,01 na tabela `products` porque:
1. O preço em `dynamic_products` estava em formato string (ex: "R$ 49 , 90")
2. A conversão falhou e usou o valor padrão (0.01)
3. A página principal busca de `dynamic_products` (preço correto)
4. A página de detalhes busca de `products` (preço 0.01)

---

## ✅ Solução

### Execute o Script SQL:

**Arquivo:** `CORRIGIR-PRECOS-PRODUTOS.sql`

```
1. Supabase → SQL Editor
2. New Query
3. Cole o conteúdo de CORRIGIR-PRECOS-PRODUTOS.sql
4. Run
```

**O que o script faz:**
1. ✅ Identifica produtos com preço 0.01
2. ✅ Busca preço correto em `dynamic_products`
3. ✅ Limpa e converte o preço corretamente
4. ✅ Atualiza na tabela `products`

---

## 📊 Resultado Esperado

```
🔧 Iniciando correção de preços...

✅ [69] Kit 4 Trincha Pincel Pintura Tigre P/ Esmalte → R$ 49.90 (era R$ 0.01)
✅ [42] Telhas de alumínio → R$ 247.85 (era R$ 0.01)
✅ [47] Rolo de Espuma para Pintura → R$ 4.12 (era R$ 0.01)
... (continua para todos os produtos)

========================================================================
📊 RESUMO DA CORREÇÃO:
   ✅ Produtos atualizados: 70
========================================================================

🎉 Preços corrigidos com sucesso!
```

---

## 🧪 Testar Após Correção

### 1. Verificar no Supabase

```
Supabase → Table Editor → products
```

Deve ver preços corretos (não mais 0.01).

### 2. Testar no App

1. Acesse a página principal
2. Veja um produto com preço (ex: R$ 49,90)
3. Clique no produto
4. ✅ Na página de detalhes, o preço deve ser o mesmo (R$ 49,90)
5. ✅ Não deve mais mostrar R$ 0,01

---

## 📊 Exemplos de Correção

| Produto | Preço em dynamic_products | Preço ANTES | Preço DEPOIS |
|---------|---------------------------|-------------|--------------|
| Kit 4 Trincha Pincel | R$ 49 , 90 | R$ 0.01 | R$ 49.90 ✅ |
| Telhas de alumínio | R$ 247,85 | R$ 0.01 | R$ 247.85 ✅ |
| Rolo de Espuma | R$ 4,12 | R$ 0.01 | R$ 4.12 ✅ |
| Tinta Acrílica | R$ 239,10 | R$ 0.01 | R$ 239.10 ✅ |

---

## 🔍 Como o Script Funciona

### 1. Busca Produtos com Preço Incorreto
```sql
SELECT * FROM products WHERE price = 0.01
```

### 2. Para Cada Produto:
```sql
-- Busca preço em dynamic_products
SELECT price FROM dynamic_products WHERE source_product_id = product.id

-- Limpa o preço
"R$ 49 , 90" → Remove "R$" → Remove espaços → "49,90"
"49,90" → Substitui "," por "." → "49.90"
"49.90" → Converte para DECIMAL → 49.90

-- Atualiza em products
UPDATE products SET price = 49.90 WHERE id = product.id
```

### 3. Verifica Resultado
```sql
SELECT COUNT(*) FROM products WHERE price = 0.01
-- Deve retornar 0 (nenhum produto com 0.01)
```

---

## ⚠️ Observações

### Produtos que Podem Continuar com 0.01:

Se o preço em `dynamic_products` estiver inválido:
- Vazio
- Apenas símbolos
- Texto sem números

**Exemplo:**
```
"R$" → 0.01 (mantém)
"Grátis" → 0.01 (mantém)
"" → 0.01 (mantém)
```

Nesses casos, você precisará atualizar manualmente:
```sql
UPDATE products 
SET price = 49.90 
WHERE title = 'Nome do Produto';
```

---

## ✅ Checklist

- [ ] Executei `CORRIGIR-PRECOS-PRODUTOS.sql`
- [ ] Vi mensagem: "Produtos atualizados: X"
- [ ] Verifiquei no Supabase Table Editor
- [ ] Testei no app (página principal → detalhes)
- [ ] ✅ Preços estão corretos

---

## 🎯 Resultado Final

### ANTES:
```
Página Principal: R$ 49,90 ✅
Página de Detalhes: R$ 0,01 ❌
```

### DEPOIS:
```
Página Principal: R$ 49,90 ✅
Página de Detalhes: R$ 49,90 ✅
```

---

**Execute o script agora e veja os preços corretos!** 🚀
