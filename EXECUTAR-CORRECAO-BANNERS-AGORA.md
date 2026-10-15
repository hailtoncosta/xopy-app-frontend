# ⚡ EXECUTAR AGORA - Correção Erro 406 Banners

## 🎯 Problema
Erro 406 ao tentar editar imagens do Carrossel Principal no painel admin.

## ✅ Solução Rápida

### 1️⃣ Acesse o Supabase
https://supabase.com/dashboard → Seu Projeto → **SQL Editor**

### 2️⃣ Cole e Execute Este SQL

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read access" ON dynamic_banners;
DROP POLICY IF EXISTS "Allow admin full access" ON dynamic_banners;

-- Criar políticas corretas
CREATE POLICY "public_read_banners" ON dynamic_banners FOR SELECT USING (true);
CREATE POLICY "authenticated_insert_banners" ON dynamic_banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_banners" ON dynamic_banners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete_banners" ON dynamic_banners FOR DELETE TO authenticated USING (true);

-- Garantir RLS habilitado
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;
```

### 3️⃣ Teste
1. Faça logout do admin
2. Faça login novamente
3. Vá em **Gerenciar Seções** > **Carrossel Principal**
4. Edite um banner → Deve funcionar! ✅

## 📄 Documentação Completa
Veja: `CORRIGIR-ERRO-BANNERS-406.md`

---
**Tempo estimado**: 2 minutos
