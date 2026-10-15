# 📱 Guia de Publicação do Xopy na Play Store

## 🎯 Pré-requisitos

### 1. Conta Google Play Console
- Criar conta em: https://play.google.com/console
- Taxa única de registro: $25 USD
- Verificar identidade e informações de pagamento

### 2. Preparar o App

#### A. Gerar os Ícones PWA
```bash
# 1. Salve a logo do Xopy como: public/logo.png
# 2. Execute o comando:
npx @vite-pwa/assets-generator --preset minimal public/logo.png public/icons
```

Isso vai gerar automaticamente:
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

#### B. Criar Ícones de Atalhos (Shortcuts)
Copie o `icon-96x96.png` e renomeie para:
```
public/icons/shortcut-products.png
public/icons/shortcut-services.png
public/icons/shortcut-offers.png
public/icons/shortcut-profile.png
```

#### C. Tirar Screenshots
Tire screenshots do app no celular (1080x1920px):
```
public/screenshots/app-home.png
public/screenshots/services.png
public/screenshots/products.png
```

---

## 🚀 Opções de Publicação

### Opção 1: TWA (Trusted Web Activity) - Recomendado ⭐

TWA permite publicar seu PWA como app nativo na Play Store.

#### Ferramentas:
1. **Bubblewrap** (Google - CLI)
2. **PWABuilder** (Microsoft - Interface visual)

#### Usando PWABuilder (Mais Fácil):

1. Acesse: https://www.pwabuilder.com/
2. Digite a URL: `https://app.xopy.com.br`
3. Clique em "Start" e aguarde a análise
4. Vá para a aba "Android"
5. Configure:
   - **Package ID**: `com.xopy.app`
   - **App name**: `Xopy`
   - **Launcher name**: `Xopy`
   - **Theme color**: `#ea580c`
   - **Background color**: `#ffffff`
   - **Icon URL**: URL do seu icon-512x512.png
6. Clique em "Generate"
7. Baixe o arquivo `.aab` (Android App Bundle)

#### Usando Bubblewrap (CLI):

```bash
# Instalar
npm install -g @bubblewrap/cli

# Inicializar
bubblewrap init --manifest https://app.xopy.com.br/manifest.json

# Configurar (responda as perguntas):
# - Package ID: com.xopy.app
# - App name: Xopy
# - etc.

# Gerar keystore (primeira vez)
keytool -genkey -v -keystore xopy-release-key.keystore -alias xopy -keyalg RSA -keysize 2048 -validity 10000

# Build
bubblewrap build

# Resultado: app-release-bundle.aab
```

---

### Opção 2: Capacitor (App Híbrido)

Se precisar de mais funcionalidades nativas:

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Inicializar
npx cap init

# Configurar capacitor.config.ts:
{
  appId: 'com.xopy.app',
  appName: 'Xopy',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

# Build do projeto
npm run build

# Adicionar plataforma Android
npx cap add android

# Sincronizar
npx cap sync

# Abrir no Android Studio
npx cap open android

# No Android Studio:
# Build > Generate Signed Bundle / APK > Android App Bundle
```

---

## 📦 Preparar para Upload

### 1. Informações Necessárias

#### Descrição Curta (80 caracteres):
```
Marketplace de construção civil - materiais, serviços e profissionais
```

#### Descrição Completa (4000 caracteres):
```
🏗️ Xopy - O Marketplace Completo da Construção Civil

Encontre tudo o que você precisa para sua obra em um só lugar!

✨ O QUE VOCÊ ENCONTRA NO XOPY:

🛒 MATERIAIS DE CONSTRUÇÃO
• Cimento, areia, brita e agregados
• Tijolos, blocos e telhas
• Ferragens e aço
• Tintas e acabamentos
• Ferramentas e equipamentos
• Materiais elétricos e hidráulicos
• E muito mais!

👷 PROFISSIONAIS QUALIFICADOS
• Pedreiros e serventes
• Eletricistas
• Encanadores
• Pintores
• Carpinteiros
• Gesseiros
• Azulejistas
• E outros profissionais

🚚 ALUGUEL DE EQUIPAMENTOS
• Betoneiras
• Andaimes
• Ferramentas elétricas
• Equipamentos pesados

💰 VANTAGENS:

✅ Preços competitivos
✅ Entrega rápida
✅ Pagamento facilitado
✅ Avaliações de clientes
✅ Suporte especializado
✅ Ofertas exclusivas
✅ Programa de fidelidade

📱 RECURSOS DO APP:

• Busca inteligente de produtos
• Filtros por categoria, preço e localização
• Comparação de preços
• Carrinho de compras
• Histórico de pedidos
• Notificações de ofertas
• Chat com vendedores
• Avaliações e comentários

🎯 PARA QUEM É O XOPY:

• Construtores e empreiteiros
• Arquitetos e engenheiros
• Proprietários fazendo reformas
• Profissionais autônomos
• Lojas de materiais de construção

Baixe agora e transforme sua experiência de compra na construção civil!

📞 SUPORTE:
Email: suporte@xopy.com.br
Site: https://xopy.com.br
```

#### Categoria:
- **Shopping**

#### Tags/Palavras-chave:
```
construção civil, materiais de construção, reforma, obra, pedreiro, eletricista, marketplace, ferramentas, cimento, tijolo
```

### 2. Assets Gráficos Necessários

#### Ícone do App:
- **512x512px** (PNG, 32-bit)
- Fundo transparente ou sólido
- ✅ Já temos: `public/icons/icon-512x512.png`

#### Feature Graphic (Banner):
- **1024x500px** (PNG ou JPG)
- Sem transparência
- Criar no Canva ou Figma

#### Screenshots (Obrigatório):
- **Mínimo 2, máximo 8**
- Tamanho: 1080x1920px (portrait) ou 1920x1080px (landscape)
- Formato: PNG ou JPG
- ✅ Preparar: home, produtos, serviços, checkout, perfil

#### Vídeo Promocional (Opcional):
- YouTube URL
- 30 segundos a 2 minutos

---

## 🎨 Criar Feature Graphic

Use o Canva ou Figma com este template:

**Dimensões**: 1024x500px

**Conteúdo sugerido**:
```
[Logo Xopy]
Marketplace da Construção Civil
Materiais • Serviços • Profissionais
```

**Cores**: Laranja (#ea580c) e branco

---

## 📋 Checklist de Publicação

### Antes de Enviar:
- [ ] Logo salva como `public/logo.png`
- [ ] Ícones gerados (72, 96, 128, 144, 152, 192, 384, 512px)
- [ ] Ícones de shortcuts criados
- [ ] Screenshots tirados (mínimo 2)
- [ ] Feature graphic criado (1024x500px)
- [ ] App Bundle (.aab) gerado
- [ ] Testado em dispositivo Android real

### No Play Console:
- [ ] Conta criada e verificada
- [ ] App criado no console
- [ ] Informações básicas preenchidas
- [ ] Descrições em português
- [ ] Categoria selecionada
- [ ] Classificação de conteúdo preenchida
- [ ] Política de privacidade URL fornecida
- [ ] Assets gráficos enviados
- [ ] App Bundle (.aab) enviado
- [ ] Versão de teste criada (opcional)
- [ ] Revisão e envio para análise

---

## 🔐 Classificação de Conteúdo

No questionário da Play Store, responda:

- **Violência**: Não
- **Conteúdo sexual**: Não
- **Linguagem imprópria**: Não
- **Drogas**: Não
- **Álcool**: Não
- **Tabaco**: Não
- **Jogos de azar**: Não
- **Compras no app**: Sim (marketplace)
- **Anúncios**: Não (ou Sim, se tiver)
- **Compartilhamento de localização**: Sim (para entregas)
- **Informações pessoais**: Sim (cadastro de usuários)

**Classificação esperada**: Livre (L) ou 10+

---

## 📄 Política de Privacidade

Você precisa ter uma URL pública com a política de privacidade.

Exemplo: `https://xopy.com.br/privacidade`

Pontos importantes:
- Quais dados coletamos (nome, email, endereço, telefone)
- Como usamos os dados (processar pedidos, entregas)
- Compartilhamento com terceiros (lojas parceiras, entregadores)
- Segurança dos dados
- Direitos do usuário (LGPD)
- Contato para dúvidas

---

## ⏱️ Tempo de Análise

- **Primeira submissão**: 3-7 dias
- **Atualizações**: 1-3 dias

---

## 🐛 Problemas Comuns

### 1. "App não atende aos requisitos de qualidade"
- Testar em diferentes dispositivos
- Verificar se todas as funcionalidades funcionam
- Garantir que não há crashes

### 2. "Ícone não atende aos padrões"
- Usar fundo sólido ou transparente
- Não usar bordas ou sombras
- Tamanho exato: 512x512px

### 3. "Política de privacidade ausente"
- Criar página de privacidade
- Adicionar URL no console
- Garantir que está acessível

### 4. "Descrição inadequada"
- Não usar palavras proibidas
- Não fazer comparações com concorrentes
- Não prometer funcionalidades que não existem

---

## 🎉 Após Aprovação

1. **Monitorar avaliações**: Responder comentários
2. **Acompanhar métricas**: Instalações, desinstalações, crashes
3. **Atualizar regularmente**: Correções e novos recursos
4. **Marketing**: Divulgar o link da Play Store

**Link da Play Store será**:
```
https://play.google.com/store/apps/details?id=com.xopy.app
```

---

## 📞 Suporte

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **PWABuilder**: https://docs.pwabuilder.com/
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap

---

## 🚀 Próximos Passos

1. Salvar logo como `public/logo.png`
2. Rodar: `npx @vite-pwa/assets-generator --preset minimal public/logo.png public/icons`
3. Criar feature graphic (1024x500px)
4. Tirar screenshots do app
5. Gerar .aab usando PWABuilder ou Bubblewrap
6. Criar conta no Play Console
7. Preencher informações e enviar para análise

**Boa sorte com a publicação! 🎊**
