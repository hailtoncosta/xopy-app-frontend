# 🔄 Limpar Cache do Frontend

## ✅ Produtos Existem no Banco

Os produtos estão no banco e aparecem no painel admin, mas não na página principal.

---

## 🔍 Causa Provável

**Cache do navegador** ou **localStorage** está mostrando dados antigos.

---

## ✅ Solução Rápida (3 opções)

### Opção 1: Limpar Cache do Navegador (Mais Simples)

1. Pressione **Ctrl + Shift + Delete** (ou Cmd + Shift + Delete no Mac)
2. Marque:
   - ✅ Cookies e dados de sites
   - ✅ Imagens e arquivos em cache
3. Clique em **Limpar dados**
4. Recarregue a página (**F5** ou **Ctrl + R**)

---

### Opção 2: Modo Anônimo (Para Testar)

1. Abra uma **janela anônima/privada**
2. Acesse o site
3. ✅ Se os produtos aparecerem, o problema é cache

---

### Opção 3: Limpar localStorage via Console

1. Pressione **F12** (abrir DevTools)
2. Vá na aba **Console**
3. Cole e execute:

```javascript
// Limpar todo o localStorage
localStorage.clear();

// Limpar caches específicos de produtos
localStorage.removeItem('paint_products_cache');
localStorage.removeItem('tiles_products_cache');
localStorage.removeItem('products_cache');
localStorage.removeItem('featured_products_cache');
localStorage.removeItem('essential_products_cache');

// Recarregar página
location.reload();
```

---

## 🧪 Testar

Após limpar o cache:
1. Recarregue a página (F5)
2. ✅ Produtos devem aparecer nas categorias
3. ✅ "Essenciais da obra" deve mostrar produtos
4. ✅ "Top escolhas" deve mostrar produtos

---

## 🔍 Se Ainda Não Aparecer

### Verificar no Console (F12)

Procure por erros:
```
❌ Failed to fetch
❌ 404 Not Found
❌ Erro ao carregar produtos
```

Se houver erros, me mostre para eu ajudar a corrigir.

---

## 📊 Verificar Dados no Console

Execute no console (F12):

```javascript
// Ver produtos em destaque
fetch('https://gpbepsinnvatubokfgvr.supabase.co/rest/v1/products?select=*&user_id=eq.91057d9a-9d8c-4596-9fc6-0b3ba539a5f3&status=eq.active&approval_status=eq.approved', {
  headers: {
    'apikey': 'sua-api-key-aqui',
    'Authorization': 'Bearer sua-api-key-aqui'
  }
})
.then(r => r.json())
.then(data => console.log('Produtos:', data.length));
```

Deve mostrar: `Produtos: 70` (ou o número total de produtos)

---

## ✅ Checklist

- [ ] Limpei cache do navegador
- [ ] Limpei localStorage via console
- [ ] Recarreguei a página (F5)
- [ ] Testei em modo anônimo
- [ ] ✅ Produtos aparecem novamente

---

**Tente a Opção 3 (localStorage.clear()) primeiro!** 🚀

É a mais rápida e resolve na maioria dos casos.
