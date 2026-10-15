# 🔍 Recuperar Produtos que Sumiram

## ❌ Problema

Produtos das categorias "Essenciais da obra" e "Top escolhas" sumiram.

---

## 🔍 Possíveis Causas

1. Produtos foram desativados (`status = 'inactive'`)
2. Produtos não foram aprovados (`approval_status != 'approved'`)
3. Produtos foram deletados
4. Filtro no código está escondendo

---

## ✅ Solução

### Execute este script:

**Arquivo:** `VERIFICAR-PRODUTOS-SUMIDOS.sql`

```
Supabase → SQL Editor → Cole o script → Run
```

**O que ele faz:**
1. ✅ Mostra TODOS os produtos (ativos e inativos)
2. ✅ Conta produtos por status
3. ✅ **REATIVA todos os produtos automaticamente**
4. ✅ Mostra produtos por categoria

---

## 📊 O Que Esperar

### Se os produtos foram desativados:
```
status    | quantidade
----------|------------
inactive  | 70

Após executar o script:

status    | quantidade
----------|------------
active    | 70

✅ Produtos reativados!
```

### Se os produtos foram deletados:
```
total_produtos: 0

❌ Produtos foram deletados
⚠️ Será necessário restaurar do backup
```

---

## 🧪 Testar Após Executar

1. Execute o script
2. Recarregue a página do app (F5)
3. ✅ Produtos devem aparecer novamente

---

## 🆘 Se os Produtos Foram Deletados

### Opção 1: Restaurar do Backup do Supabase

```
Supabase → Database → Backups → Restore
```

### Opção 2: Recriar os Produtos

Se você tem os dados, pode recriar:

```sql
INSERT INTO products (
    user_id,
    title,
    description,
    category,
    price,
    quantity,
    seller_type,
    product_type,
    seller_info,
    status,
    approval_status
) VALUES (
    '91057d9a-9d8c-4596-9fc6-0b3ba539a5f3',
    'Nome do Produto',
    'Descrição',
    'Categoria',
    99.90,
    100,
    'business',
    'new',
    '{"name": "Xopy", "businessName": "Xopy"}',
    'active',
    'approved'
);
```

---

## 📋 Checklist

- [ ] Executei `VERIFICAR-PRODUTOS-SUMIDOS.sql`
- [ ] Vi quantos produtos existem
- [ ] Vi o status dos produtos
- [ ] Script reativou os produtos
- [ ] Recarreguei a página do app
- [ ] ✅ Produtos voltaram a aparecer

---

**Execute o script agora!** 🚀
