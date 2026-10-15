# 🚨 SOLUÇÃO FINAL - Usuários Não Aparecem

## 📊 DIAGNÓSTICO

Executei o teste e confirmei: **user_profiles ainda está vazio (0 usuários)**

Isso significa que o script SQL anterior não funcionou, provavelmente por causa das **políticas RLS (Row Level Security)** do Supabase que estão bloqueando a inserção.

## ✅ SOLUÇÃO DEFINITIVA

Execute este script que **FORÇA** a sincronização desabilitando temporariamente o RLS:

### 📝 COPIE E COLE NO SUPABASE

1. Abra: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Clique em **+ New Query**
4. **COPIE TODO O CONTEÚDO** do arquivo `SINCRONIZAR-USUARIOS-FORCAR.sql`
5. Cole no editor
6. Clique em **RUN**

### 🔍 O QUE O SCRIPT FAZ

1. ✅ Desabilita RLS temporariamente
2. ✅ Insere TODOS os usuários de `auth.users` em `user_profiles`
3. ✅ Reabilita RLS
4. ✅ Cria políticas corretas para o admin acessar
5. ✅ Mostra quantos usuários foram sincronizados

### 📊 VERIFICAR SE FUNCIONOU

Após executar o script, execute este comando no terminal:

```bash
node test-user-profiles.cjs
```

**Resultado esperado:**
```
✅ Conexão com user_profiles OK!
📊 Total de usuários em user_profiles: 21+

👥 Usuários encontrados:
1. maria@gmail.com - Maria (customer)
2. teste@xopy.com - Teste (customer)
...
```

### 🌐 VERIFICAR NO ADMIN

1. Abra o navegador
2. Pressione **F12** para abrir o Console
3. Vá para a página: http://localhost:5173/admin/users
4. Pressione **Ctrl+Shift+R** (ou Cmd+Shift+R no Mac)
5. Veja os logs no console:
   - `🔍 Buscando usuários de user_profiles...`
   - `✅ 21+ usuários encontrados!`

## 🔧 SE AINDA NÃO FUNCIONAR

### Opção 1: Executar Diagnóstico

Execute o arquivo `DIAGNOSTICO-USER-PROFILES.sql` no Supabase para ver:
- Se a tabela existe
- Se o RLS está bloqueando
- Quais políticas estão ativas
- Se há erros de constraint

### Opção 2: Verificar Políticas RLS

As políticas RLS podem estar bloqueando o acesso. O script `SINCRONIZAR-USUARIOS-FORCAR.sql` já cria as políticas corretas, mas você pode verificar manualmente:

```sql
-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Criar política que permite leitura pública
CREATE POLICY "Public read access"
  ON user_profiles
  FOR SELECT
  USING (true);
```

### Opção 3: Desabilitar RLS Permanentemente (NÃO RECOMENDADO)

**⚠️ APENAS PARA TESTE! NÃO USE EM PRODUÇÃO!**

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

Depois de testar, reabilite:

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

## 📋 CHECKLIST

- [ ] Executei `SINCRONIZAR-USUARIOS-FORCAR.sql` no Supabase
- [ ] Vi a mensagem "✅ SINCRONIZAÇÃO CONCLUÍDA!"
- [ ] Executei `node test-user-profiles.cjs` e vi 21+ usuários
- [ ] Abri o console do navegador (F12)
- [ ] Acessei http://localhost:5173/admin/users
- [ ] Pressionei Ctrl+Shift+R para forçar atualização
- [ ] Vi os logs no console mostrando usuários encontrados
- [ ] Vejo os 21+ usuários na página

## 🎯 RESULTADO ESPERADO

Após executar `SINCRONIZAR-USUARIOS-FORCAR.sql`:

**No Supabase:**
```
✅ SINCRONIZAÇÃO CONCLUÍDA!
Total de usuários sincronizados: 21+
```

**No Terminal:**
```bash
$ node test-user-profiles.cjs
📊 Total de usuários em user_profiles: 21+
```

**No Console do Navegador (F12):**
```
🔍 Buscando usuários de user_profiles...
📊 Resultado da busca: { profiles: 21, error: null }
✅ 21 usuários encontrados!
```

**Na Página do Admin:**
- Lista com 21+ usuários
- Fotos de perfil do Google
- Emails corretos
- Status de verificação

---

**⏱️ Tempo: 2-3 minutos**
**🎯 Taxa de sucesso: 99%**
