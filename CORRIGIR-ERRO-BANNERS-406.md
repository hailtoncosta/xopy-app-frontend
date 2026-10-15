# 🔧 Correção do Erro 406 ao Editar Banners

## 📋 Problema Identificado

Quando o admin tenta editar imagens do **Carrossel Principal** na página "Gerenciar Seções", ocorre o erro:

```
Failed to load resource: the server responded with a status of 406 ()
❌ Erro na tentativa: Tabela não encontrada: Execute as correções do banco
```

## 🔍 Causa do Problema

O erro 406 indica que as **políticas RLS (Row Level Security)** da tabela `dynamic_banners` estão bloqueando a atualização dos banners. Isso acontece porque:

1. A tabela existe ✅
2. Tem dados ✅
3. Mas as políticas RLS não permitem UPDATE para usuários autenticados ❌

## ✅ Solução

Execute o script SQL abaixo no **Supabase SQL Editor** para corrigir as políticas RLS:

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar o Script de Correção

Copie e cole o seguinte SQL no editor:

```sql
-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read access" ON dynamic_banners;
DROP POLICY IF EXISTS "Allow admin full access" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable read access for all users" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON dynamic_banners;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON dynamic_banners;

-- 2. Criar políticas RLS corretas

-- Leitura pública (qualquer um pode ler banners)
CREATE POLICY "public_read_banners" 
ON dynamic_banners
FOR SELECT
USING (true);

-- Inserção para usuários autenticados
CREATE POLICY "authenticated_insert_banners" 
ON dynamic_banners
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Atualização para usuários autenticados
CREATE POLICY "authenticated_update_banners" 
ON dynamic_banners
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Exclusão para usuários autenticados
CREATE POLICY "authenticated_delete_banners" 
ON dynamic_banners
FOR DELETE
TO authenticated
USING (true);

-- 3. Garantir que RLS está habilitado
ALTER TABLE dynamic_banners ENABLE ROW LEVEL SECURITY;

-- 4. Verificar as novas políticas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'dynamic_banners';
```

### Passo 3: Executar e Verificar

1. Clique em **Run** (ou pressione Ctrl+Enter)
2. Verifique se aparece a mensagem de sucesso
3. Confirme que as 4 políticas foram criadas:
   - `public_read_banners` (SELECT)
   - `authenticated_insert_banners` (INSERT)
   - `authenticated_update_banners` (UPDATE)
   - `authenticated_delete_banners` (DELETE)

### Passo 4: Testar no Admin

1. Faça logout do painel admin
2. Faça login novamente
3. Vá em **Gerenciar Seções** > **Carrossel Principal**
4. Tente editar um banner e mudar a imagem
5. Deve funcionar sem erros! ✅

## 🔐 O Que Foi Corrigido

### Antes (Problema)
- Política muito restritiva que verificava `auth.jwt() ->> 'role' = 'admin'`
- Isso não funcionava porque o JWT não contém o campo `role` diretamente
- Resultado: Erro 406 ao tentar atualizar

### Depois (Solução)
- Políticas mais simples que permitem acesso a usuários autenticados
- Usa `TO authenticated` que é o padrão do Supabase
- Qualquer usuário logado pode gerenciar banners (você pode restringir mais tarde se necessário)

## 🎯 Próximos Passos (Opcional)

Se você quiser restringir o acesso apenas para admins, pode criar uma política mais específica:

```sql
-- Atualização APENAS para admins
DROP POLICY IF EXISTS "authenticated_update_banners" ON dynamic_banners;

CREATE POLICY "admin_update_banners" 
ON dynamic_banners
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
```

## 📝 Notas Importantes

1. **Backup**: As políticas antigas são removidas antes de criar as novas
2. **Segurança**: A leitura continua pública (necessário para exibir banners no site)
3. **Autenticação**: Apenas usuários logados podem modificar banners
4. **RLS**: Row Level Security continua habilitado para proteção

## 🆘 Problemas?

Se ainda tiver erros após executar o script:

1. Verifique se você está logado como admin no painel
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Faça logout e login novamente
4. Verifique o console do navegador para novos erros

## ✅ Resultado Esperado

Após a correção, você deve conseguir:
- ✅ Ver todos os banners na lista
- ✅ Editar título e descrição
- ✅ Fazer upload de novas imagens
- ✅ Ativar/desativar banners
- ✅ Reordenar banners
- ✅ Deletar banners

---

**Arquivo de script SQL**: `fix-banners-rls.sql`
**Data**: 18/10/2025
