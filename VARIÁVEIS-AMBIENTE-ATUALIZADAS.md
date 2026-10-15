# Variáveis de Ambiente Atualizadas

## ✅ Alterações Realizadas

### Arquivo `.env` Atualizado

Adicionadas as seguintes variáveis para o novo domínio:

```env
# URL do aplicativo (novo domínio)
VITE_APP_URL="https://app.xopy.com.br"
VITE_SITE_URL="https://app.xopy.com.br"
```

### Arquivo `.env.example` Criado

Criado arquivo de exemplo para documentar as variáveis necessárias.

---

## 📋 Variáveis de Ambiente Completas

### Produção (app.xopy.com.br)

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="gpbepsinnvatubokfgvr"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://gpbepsinnvatubokfgvr.supabase.co"

# Application URLs
VITE_APP_URL="https://app.xopy.com.br"
VITE_SITE_URL="https://app.xopy.com.br"
```

### Desenvolvimento Local

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="gpbepsinnvatubokfgvr"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://gpbepsinnvatubokfgvr.supabase.co"

# Application URLs (localhost para desenvolvimento)
VITE_APP_URL="http://localhost:8080"
VITE_SITE_URL="http://localhost:8080"
```

---

## 🔧 Como Usar as Variáveis no Código

### Exemplo 1: Obter URL do App

```typescript
const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8080';
```

### Exemplo 2: Construir URL de Callback

```typescript
const callbackUrl = `${import.meta.env.VITE_APP_URL}/auth/callback`;
```

### Exemplo 3: Compartilhar Link

```typescript
const shareUrl = `${import.meta.env.VITE_SITE_URL}/produto/${productId}`;
```

---

## 📝 Verificações Necessárias

Após atualizar as variáveis de ambiente, verifique:

### ✅ 1. Código que Usa URLs Hardcoded

Procure e substitua URLs hardcoded por variáveis de ambiente:

```typescript
// ❌ Evite
const url = 'https://www.xopy.com.br/produto/123';

// ✅ Use
const url = `${import.meta.env.VITE_APP_URL}/produto/123`;
```

### ✅ 2. Configurações de Deploy

Se você usa plataformas de deploy (Vercel, Netlify, etc.), adicione as variáveis lá também:

**Vercel:**
- Settings → Environment Variables
- Adicione `VITE_APP_URL` e `VITE_SITE_URL`

**Netlify:**
- Site settings → Environment variables
- Adicione `VITE_APP_URL` e `VITE_SITE_URL`

### ✅ 3. Supabase Dashboard

Certifique-se de que o Supabase está configurado com o novo domínio:

1. **Authentication → URL Configuration**
   - Site URL: `https://app.xopy.com.br`
   - Redirect URLs: `https://app.xopy.com.br/**`

2. **Authentication → Providers → Google**
   - Verifique se está habilitado
   - Confirme Client ID e Secret

---

## 🔍 Arquivos que Podem Precisar de Atualização

### Verificar se há URLs hardcoded em:

```bash
# Procurar por www.xopy.com.br
grep -r "www.xopy.com.br" src/

# Procurar por xopy.com.br
grep -r "xopy.com.br" src/

# Procurar por URLs hardcoded
grep -r "https://" src/ | grep -v "supabase.co"
```

---

## 🚀 Próximos Passos

1. ✅ Variáveis de ambiente atualizadas
2. ⏳ Atualizar Google Cloud Console (veja ATUALIZAR-DOMINIO-GOOGLE-AUTH.md)
3. ⏳ Atualizar Supabase Dashboard (veja ATUALIZAR-DOMINIO-GOOGLE-AUTH.md)
4. ⏳ Testar autenticação com Google
5. ⏳ Verificar se há URLs hardcoded no código
6. ⏳ Atualizar variáveis na plataforma de deploy

---

## 📱 Variáveis para PWA

O manifest.json e vite.config.ts já estão configurados corretamente com URLs relativas, então não precisam de alteração.

### manifest.json
```json
{
  "start_url": "/",
  "scope": "/"
}
```

Essas URLs relativas funcionam em qualquer domínio.

---

## 🔐 Segurança

### Variáveis Públicas vs Privadas

**Variáveis com prefixo `VITE_`:**
- ✅ São expostas no código do cliente
- ✅ Podem ser usadas no frontend
- ⚠️ Não coloque informações sensíveis

**Variáveis sem prefixo `VITE_`:**
- ❌ Não são acessíveis no código do cliente
- ✅ Use para chaves privadas (Service Role Key)
- ✅ Use apenas em scripts Node.js

### Exemplo de Variáveis Privadas

Se você tiver scripts que precisam de acesso admin ao Supabase:

```env
# Não adicione ao .env público!
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key-aqui"
```

---

## 📚 Documentação

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Supabase Auth Configuration:** https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2

---

## ✅ Checklist Final

- [x] Variáveis de ambiente atualizadas no `.env`
- [x] Arquivo `.env.example` criado
- [ ] Google Cloud Console atualizado
- [ ] Supabase Dashboard atualizado
- [ ] Variáveis adicionadas na plataforma de deploy
- [ ] Código verificado para URLs hardcoded
- [ ] Testes de autenticação realizados
