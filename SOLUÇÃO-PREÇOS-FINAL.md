# 🔧 Solução Final para Preços - Método Simples

## ✅ Solução Mais Simples

Use este script que atualiza os preços manualmente:

**Arquivo:** `CORRIGIR-PRECOS-SIMPLES.sql`

```
Supabase → SQL Editor → Cole o script → Run
```

Este script:
- ✅ Atualiza preços manualmente (sem conversão complexa)
- ✅ Baseado nos nomes dos produtos
- ✅ Valores já conhecidos

---

## 📊 Exemplos de Atualização

```sql
UPDATE products SET price = 49.90 
WHERE title LIKE '%Trincha%';

UPDATE products SET price = 247.85 
WHERE title LIKE '%Telhas de alumínio%';

UPDATE products SET price = 4.12 
WHERE title LIKE '%Rolo de Espuma%';
```

---

## 🧪 Testar

Após executar:
1. Acesse um produto
2. Veja o preço na página de detalhes
3. ✅ Deve estar correto

---

## 🆘 Se Ainda Houver Produtos com R$ 0,01

Execute esta query para ver quais:

```sql
SELECT id, title, price 
FROM products 
WHERE price = 0.01;
```

E atualize manualmente:

```sql
UPDATE products 
SET price = 99.90 
WHERE title = 'Nome Exato do Produto';
```

---

**Execute `CORRIGIR-PRECOS-SIMPLES.sql` agora!** 🚀
