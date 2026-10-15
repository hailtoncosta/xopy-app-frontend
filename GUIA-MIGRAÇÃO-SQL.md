# 🚀 Guia de Migração via SQL (Método Mais Simples)

## ✅ Vantagens Deste Método

- ⚡ **Mais rápido** - Executa direto no banco de dados
- 🎯 **Mais simples** - Apenas copiar e colar SQL
- 🔒 **Mais seguro** - Transação única no banco
- 📊 **Mais claro** - Vê o progresso em tempo real
- 🧹 **Mais limpo** - Remove tabela desnecessária

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ Obter UUID do Admin

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Users**
4. Copie o **UUID** do usuário admin
   - Formato: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2️⃣ Editar o Script SQL

1. Abra o arquivo: `migrate-products.sql`
2. Encontre a linha 11:
   ```sql
   admin_uuid UUID := 'SEU_UUID_ADMIN_AQUI';
   ```
3. Substitua por:
   ```sql
   admin_uuid UUID := 'cole-seu-uuid-aqui';
   ```
4. **IMPORTANTE:** Substitua também nas linhas 177 e 189 (queries de verificação)

### 3️⃣ Executar no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor** (menu lateral)
4. Clique em: **New Query**
5. Cole todo o conteúdo do arquivo `migrate-products.sql`
6. Clique em: **Run** (ou pressione Ctrl+Enter)

### 4️⃣ Acompanhar o Progresso

Você verá algo assim no console:

```
🔄 Iniciando migração de produtos...

📦 [41] Tintas
   ✅ Migrado → UUID: a1b2c3d4...
   💰 Preço: R$ 75.40
   📂 Categoria: Pintura

📦 [19] Rolo Pintura + Bandeja
   ✅ Migrado → UUID: b2c3d4e5...
   💰 Preço: R$ 28.90
   📂 Categoria: Pintura

... (continua para todos os produtos)

========================================================================
📊 RESUMO DA MIGRAÇÃO:
   ✅ Produtos migrados: 70
   ❌ Erros: 0
========================================================================

🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!
```

### 5️⃣ Verificar Resultados

O script automaticamente executa queries de verificação:

```sql
-- Total de produtos migrados
total_produtos | total_categorias | valor_total_estoque
---------------|------------------|--------------------
70             | 8                | 15234.50

-- Produtos por categoria
category                  | quantidade | preco_medio | preco_minimo | preco_maximo
--------------------------|------------|-------------|--------------|-------------
Pintura                   | 15         | 125.50      | 4.12         | 239.10
Material de Construção    | 20         | 450.30      | 18.50        | 4923.00
Ferramentas              | 18         | 280.75      | 25.11        | 965.00
...
```

---

## 🗑️ Remover Tabela `dynamic_products` (Opcional)

### ⚠️ IMPORTANTE: Só faça isso DEPOIS de confirmar que tudo funciona!

1. Teste comprar alguns produtos
2. Confirme que o checkout funciona
3. Verifique que os produtos aparecem corretamente

### Quando estiver seguro:

1. Abra o arquivo `migrate-products.sql`
2. Encontre a seção "PARTE 2: LIMPEZA"
3. **Descomente** o código (remova `/*` e `*/`)
4. Execute novamente no SQL Editor

Ou execute diretamente:

```sql
-- Remove a tabela dynamic_products
DROP TABLE IF EXISTS dynamic_products CASCADE;
```

---

## 🎯 O Que o Script Faz?

### Parte 1: Migração

1. ✅ Lê todos os produtos de `dynamic_products`
2. ✅ Limpa e converte preços (remove R$, vírgulas, etc)
3. ✅ Mapeia categorias para categorias válidas
4. ✅ Cria produtos em `products` com UUID
5. ✅ Adiciona informações do vendedor (Xopy Marketplace)
6. ✅ Define status como `active` e `approved`
7. ✅ Mostra progresso em tempo real

### Parte 2: Limpeza (Opcional)

1. 🗑️ Remove a tabela `dynamic_products`
2. 🧹 Limpa referências CASCADE
3. ✅ Deixa apenas a tabela `products`

### Parte 3: Verificação

1. 📊 Conta total de produtos migrados
2. 📈 Agrupa por categoria
3. 💰 Calcula estatísticas de preço

---

## 🔍 Mapeamento de Categorias

O script automaticamente converte categorias antigas para válidas:

```
Material                  → Material de Construção
Tijolos e Blocos         → Material de Construção
Cimento e Argamassa      → Material de Construção
Madeiras                 → Material de Construção
Ferragens                → Ferramentas
Ferramentas Elétricas    → Ferramentas
Geral                    → Outros
Destaque                 → Outros
Teste                    → Outros
```

Categorias válidas:
- Material de Construção
- Ferramentas
- Pintura
- Elétrica
- Hidráulica
- Acabamento
- Telhas e Coberturas
- Decoração
- Outros

---

## 💰 Tratamento de Preços

O script limpa automaticamente:

```
"R$ 75.40"        → 75.40
"R$ 1.799,00"     → 1799.00
"Por: R$ 239,10"  → 239.10
"R$ 4.923"        → 4923.00
"R$ 49 , 90"      → 49.90
```

Se o preço for inválido ou zero, usa R$ 0.01 como padrão.

---

## 🆚 Comparação: SQL vs Script Node.js

### ✅ SQL (Recomendado):
- ⚡ Mais rápido (executa no servidor)
- 🎯 Mais simples (copiar e colar)
- 🔒 Transação única (mais seguro)
- 📊 Feedback em tempo real
- 🧹 Pode remover tabela antiga

### ❌ Script Node.js:
- 🐌 Mais lento (rede + processamento)
- 🔧 Precisa configurar ambiente
- 📦 Precisa instalar dependências
- ⚠️ Múltiplas requisições HTTP

---

## 🧪 Testar Após Migração

### 1. Verificar Produtos no Dashboard

```
Supabase → Table Editor → products
```

Deve ver 70 produtos com:
- ✅ UUID válido
- ✅ Preços corretos
- ✅ Categorias válidas
- ✅ Status: active
- ✅ Approval: approved

### 2. Testar Compra

1. Acesse seu site
2. Clique em qualquer produto
3. Clique em "Comprar Agora"
4. ✅ Checkout deve abrir normalmente
5. ✅ Pode finalizar a compra

### 3. Verificar Pedidos

```
Supabase → Table Editor → orders
```

Deve ver pedidos com `product_id` sendo UUID válido.

---

## 🆘 Problemas Comuns

### Erro: "UUID do admin não configurado"
```
❌ ERRO: Configure o UUID do admin antes de executar!
```
**Solução:** Substitua `SEU_UUID_ADMIN_AQUI` pelo UUID real (linha 11)

### Erro: "permission denied"
```
ERROR: permission denied for table products
```
**Solução:** 
1. Verifique se você está logado como admin
2. Verifique as políticas RLS da tabela `products`
3. Temporariamente desabilite RLS para migração

### Erro: "column images does not exist"
```
ERROR: column "images" of relation "products" does not exist
```
**Solução:** A tabela `products` precisa ter a coluna `images` do tipo `TEXT[]`

Adicione a coluna:
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
```

---

## 📊 Resultado Final

### ANTES:
```
dynamic_products: 70 produtos ❌ Não podem ser comprados
products: 0 produtos
```

### DEPOIS:
```
products: 70 produtos ✅ Todos podem ser comprados
dynamic_products: removida (opcional)
```

---

## ✅ Checklist

- [ ] Obtive o UUID do admin
- [ ] Editei o arquivo `migrate-products.sql` (linha 11)
- [ ] Editei as queries de verificação (linhas 177 e 189)
- [ ] Executei o script no SQL Editor do Supabase
- [ ] Vi a mensagem de sucesso
- [ ] Verifiquei os produtos na tabela `products`
- [ ] Testei comprar um produto
- [ ] Confirmei que o checkout funciona
- [ ] (Opcional) Removi a tabela `dynamic_products`

---

## 🎉 Pronto!

Após executar o script SQL:
- ✅ Todos os 70 produtos migrados
- ✅ Arquitetura simplificada
- ✅ Checkout funcionando
- ✅ Sem duplicação de dados

**Tempo total:** ~5 minutos ⚡

---

**Este é o método MAIS SIMPLES e RECOMENDADO!** 🚀
