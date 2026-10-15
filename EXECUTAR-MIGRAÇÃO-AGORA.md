# ⚡ EXECUTAR MIGRAÇÃO AGORA - Passo a Passo

## ✅ UUID Já Configurado!

Seu UUID do admin já está configurado: `91057d9a-9d8c-4596-9fc6-0b3ba539a5f3`

---

## 🚀 4 Passos Simples

### 1️⃣ Preparar Tabela (30 segundos) ✅ FEITO

Você já executou este passo!

---

### 2️⃣ Executar Migração (3 minutos) ✅ FEITO

Você já executou este passo! Os produtos estão em `products`.

---

### 3️⃣ Vincular Produtos (1 minuto) ⚠️ IMPORTANTE!

**Este é o passo que está faltando!**

1. No Supabase SQL Editor, clique em: **New Query**
2. Cole todo o conteúdo de: **`VINCULAR-PRODUTOS.sql`**
3. Clique em: **Run**

**Resultado esperado:**
```
🔗 Iniciando vinculação de produtos...

✅ [41] Tintas → UUID: a1b2c3d4...
✅ [42] Rolo Pintura → UUID: b2c3d4e5...
✅ [43] Luminária → UUID: c3d4e5f6...

... (70 produtos)

========================================================================
📊 RESUMO DA VINCULAÇÃO:
   ✅ Produtos vinculados: 70
   ⚠️  Não encontrados: 0
========================================================================

🎉 VINCULAÇÃO CONCLUÍDA!
```

**O que este script faz:**
- Busca cada produto em `dynamic_products`
- Encontra o produto correspondente em `products` (pelo nome)
- Atualiza o campo `source_product_id` em `dynamic_products`
- Agora quando clicar em "Comprar Agora", o sistema encontrará o UUID correto!

---

### 4️⃣ Testar (2 minutos)

1. Acesse seu site
2. Clique em qualquer produto
3. Clique em "Comprar Agora"
4. ✅ Checkout deve funcionar!

---

## 🗑️ Limpar Tabela Antiga (Opcional)

**⚠️ Só execute DEPOIS de confirmar que tudo funciona!**

1. No Supabase SQL Editor, clique em: **New Query**
2. Cole o conteúdo de: **`LIMPAR-DYNAMIC-PRODUCTS.sql`**
3. Clique em: **Run**

**Resultado:**
```
✅ Tabela dynamic_products removida
🎉 Agora existe apenas a tabela "products"
```

---

## 📁 Arquivos para Usar

1. ✅ `prepare-products-table.sql` - Execute primeiro (FEITO)
2. ✅ `MIGRAR-PRODUTOS-PRONTO.sql` - Execute depois (FEITO)
3. ⚠️ **`VINCULAR-PRODUTOS.sql`** - **EXECUTE AGORA!** (Resolve o erro)
4. ✅ `LIMPAR-DYNAMIC-PRODUCTS.sql` - Execute por último (opcional)

---

## 🎯 Resultado Final

### ANTES:
```
❌ dynamic_products: 70 produtos (não podem ser comprados)
❌ products: vazia
```

### DEPOIS:
```
✅ products: 70 produtos (todos podem ser comprados)
✅ dynamic_products: removida (opcional)
```

---

## 🆘 Se Der Erro

### Erro: "column images does not exist"
- Execute primeiro: `prepare-products-table.sql`

### Erro: "permission denied"
- Verifique se você está logado como admin no Supabase

### Erro: "table dynamic_products does not exist"
- Verifique se a tabela existe no seu banco

---

## ✅ Checklist

- [x] Executei `prepare-products-table.sql`
- [x] Executei `MIGRAR-PRODUTOS-PRONTO.sql`
- [x] Vi mensagem: "Migração concluída com sucesso"
- [x] Verifiquei produtos na tabela `products`
- [ ] **Executei `VINCULAR-PRODUTOS.sql`** ⚠️ FALTA ESTE!
- [ ] Testei comprar um produto
- [ ] (Opcional) Executei `LIMPAR-DYNAMIC-PRODUCTS.sql`

---

## 🎉 Pronto!

**Tempo total:** ~5 minutos  
**Resultado:** 70 produtos funcionando! ✅

---

**Arquivos prontos com UUID configurado!** 🚀  
Basta copiar e colar no Supabase SQL Editor.
