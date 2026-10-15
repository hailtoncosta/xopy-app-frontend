# Atualizar Domínio para Autenticação Google

## 🎯 Problema
O projeto mudou de `www.xopy.com.br` para `https://app.xopy.com.br/`, causando erro na autenticação do Google.

## ✅ Solução

### 1️⃣ Atualizar no Google Cloud Console

#### Passo 1: Acessar o Console
1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto correto (provavelmente "Xopy" ou similar)

#### Passo 2: Configurar OAuth 2.0
1. No menu lateral, vá em **APIs & Services** → **Credentials**
2. Encontre o **OAuth 2.0 Client ID** usado pelo Supabase
   - Geralmente tem um nome como "Web client" ou "Supabase"
3. Clique no nome para editar

#### Passo 3: Adicionar Novos Domínios

**Authorized JavaScript origins:**
```
https://app.xopy.com.br
https://gpbepsinnvatubokfgvr.supabase.co
```

**Authorized redirect URIs:**
```
https://app.xopy.com.br/auth/callback
https://gpbepsinnvatubokfgvr.supabase.co/auth/v1/callback
```

#### Passo 4: Salvar
- Clique em **Save**
- Aguarde alguns minutos para as alterações propagarem

---

### 2️⃣ Atualizar no Supabase Dashboard

#### Passo 1: Acessar Configurações de URL
1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **gpbepsinnvatubokfgvr**
3. Vá em **Authentication** → **URL Configuration**

#### Passo 2: Atualizar URLs

**Site URL:**
```
https://app.xopy.com.br
```

**Redirect URLs (adicione todas):**
```
https://app.xopy.com.br/**
https://app.xopy.com.br/auth/callback
http://localhost:8080/**
http://localhost:8080/auth/callback
```

#### Passo 3: Verificar Provider do Google
1. Vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Verifique se está **Enabled**
4. Confirme que o **Client ID** e **Client Secret** estão preenchidos

---

### 3️⃣ Atualizar Variáveis de Ambiente (Se Necessário)

Se você tiver variáveis de ambiente relacionadas ao domínio, atualize no arquivo `.env`:

```env
VITE_APP_URL=https://app.xopy.com.br
VITE_REDIRECT_URL=https://app.xopy.com.br/auth/callback
```

---

### 4️⃣ Testar a Autenticação

#### Teste 1: Login com Google
1. Acesse: https://app.xopy.com.br/auth
2. Clique em "Entrar com Google"
3. ✅ Deve redirecionar para o Google
4. ✅ Após autorizar, deve voltar para o app

#### Teste 2: Callback
1. Verifique se após o login você é redirecionado para a página correta
2. Verifique se o usuário fica autenticado

---

## 🔍 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** A URL de callback não está autorizada no Google Cloud Console.

**Solução:**
1. Copie a URL exata do erro
2. Adicione ela em **Authorized redirect URIs** no Google Cloud Console
3. Aguarde 5 minutos e teste novamente

### Erro: "Invalid redirect URL"

**Causa:** A URL não está na lista de Redirect URLs do Supabase.

**Solução:**
1. Vá em Supabase → Authentication → URL Configuration
2. Adicione a URL em **Redirect URLs**
3. Use o padrão `https://app.xopy.com.br/**` para permitir todas as rotas

### Erro: "Access blocked: This app's request is invalid"

**Causa:** O OAuth consent screen não está configurado corretamente.

**Solução:**
1. No Google Cloud Console, vá em **APIs & Services** → **OAuth consent screen**
2. Verifique se o app está em produção ou teste
3. Se estiver em teste, adicione os emails dos usuários que podem testar
4. Se estiver em produção, verifique se foi aprovado pelo Google

---

## 📋 Checklist de Verificação

Antes de considerar concluído, verifique:

- [ ] Google Cloud Console atualizado com novo domínio
- [ ] Supabase Site URL atualizado
- [ ] Supabase Redirect URLs atualizados
- [ ] Provider do Google está habilitado no Supabase
- [ ] Teste de login com Google funcionando
- [ ] Callback redirecionando corretamente
- [ ] Usuário fica autenticado após login

---

## 🔗 Links Úteis

- **Google Cloud Console:** https://console.cloud.google.com/
- **Supabase Dashboard:** https://supabase.com/dashboard/project/gpbepsinnvatubokfgvr
- **Documentação Supabase Auth:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

## 📝 Notas Importantes

1. **Propagação:** Alterações no Google Cloud Console podem levar até 5 minutos para propagar
2. **Cache:** Limpe o cache do navegador se continuar com erro
3. **HTTPS:** Certifique-se de usar HTTPS em produção
4. **Localhost:** Mantenha as URLs de localhost para desenvolvimento local

---

## 🆘 Se Ainda Não Funcionar

1. Verifique os logs no Supabase Dashboard:
   - Vá em **Authentication** → **Logs**
   - Procure por erros relacionados ao Google

2. Verifique o console do navegador:
   - Abra DevTools (F12)
   - Vá na aba Console
   - Procure por erros de autenticação

3. Teste com modo anônimo:
   - Abra uma janela anônima
   - Tente fazer login novamente
   - Isso elimina problemas de cache

---

## 🎉 Após Configurar

Depois que tudo estiver funcionando:

1. Teste com diferentes contas Google
2. Verifique se os dados do usuário são salvos corretamente
3. Teste o logout e login novamente
4. Documente as configurações para referência futura
