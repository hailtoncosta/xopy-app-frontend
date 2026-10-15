# Configuração do Supabase para o Sistema de Vendas

## Passos para configurar o Supabase:

### 1. Criar conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Configurar variáveis de ambiente
1. No dashboard do seu projeto Supabase, vá em **Settings > API**
2. Copie a **Project URL** e **anon public key**
3. Edite o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3. Criar as tabelas no banco de dados
1. No dashboard do Supabase, vá em **SQL Editor**
2. Copie e execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará as tabelas `products` e `product_images` com todas as políticas de segurança

### 4. Configurar Storage para imagens
1. No dashboard do Supabase, vá em **Storage**
2. Crie um novo bucket chamado `product-images`
3. Marque como **Public bucket**
4. As políticas de acesso já estão definidas no schema SQL

### 5. Testar a funcionalidade
1. Execute `npm run dev` para iniciar o servidor
2. Faça login na aplicação
3. Acesse o perfil do usuário
4. Clique em "Quero Vender"
5. Preencha o formulário e teste o envio

## Estrutura das tabelas criadas:

### Tabela `products`
- `id`: UUID (chave primária)
- `user_id`: UUID (referência ao usuário)
- `title`: Título do produto
- `description`: Descrição detalhada
- `category`: Categoria do produto
- `price`: Preço em decimal
- `quantity`: Quantidade disponível
- `seller_type`: Tipo de vendedor (individual/business)
- `product_type`: Tipo de produto (new/leftover)
- `manufacturing_date`: Data de fabricação (opcional)

### Tabela `service_providers` (NOVA)
- `id`: UUID (chave primária)
- `user_id`: UUID (referência ao usuário)
- `name`: Nome do prestador
- `phone`: Telefone de contato
- `email`: Email de contato
- `address`: Endereço (opcional)
- `neighborhood`: Bairro (opcional)
- `city`: Cidade (opcional)
- `experience`: Experiência profissional
- `daily_rate`: Valor da diária
- `specialties`: Especialidades (opcional)
- `description`: Descrição dos serviços (opcional)
- `category`: Categoria do serviço
- `status`: Status do cadastro (pending/approved/rejected)
- `documents`: Documentos em JSON (opcional)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## ✅ FUNCIONALIDADE DE PRESTADORES DE SERVIÇOS IMPLEMENTADA

### Como testar o cadastro de prestadores:
1. Acesse `http://localhost:8081/service-providers/pedreiro`
2. Clique em "Quero me cadastrar como Pedreiro"
3. Preencha todos os campos obrigatórios:
   - Nome completo
   - Telefone
   - Email
   - Experiência
   - Valor da diária
4. Clique em "Enviar Cadastro"
5. Os dados serão salvos na tabela `service_providers` do Supabase

### Status do cadastro:
- **pending**: Aguardando aprovação (padrão)
- **approved**: Aprovado e visível publicamente
- **rejected**: Rejeitado

### Arquivos implementados:
- `src/services/serviceProviderService.ts`: Serviço para CRUD
- `src/pages/ServiceProviders.tsx`: Modal de cadastro funcional
- `supabase-schema.sql`: Schema atualizado com nova tabela
- `seller_info`: Informações do vendedor em JSON
- `status`: Status do produto (active/sold/inactive)
- `created_at` e `updated_at`: Timestamps

### Tabela `product_images`
- `id`: UUID (chave primária)
- `product_id`: UUID (referência ao produto)
- `image_url`: URL pública da imagem
- `image_path`: Caminho no storage
- `is_primary`: Se é a imagem principal
- `created_at`: Timestamp

## Funcionalidades implementadas:

✅ **Modal de venda funcional**
- Formulário em 4 etapas
- Validação de campos obrigatórios
- Upload de múltiplas imagens
- Suporte para pessoa física e jurídica
- Produtos novos e sobras

✅ **Integração com Supabase**
- Salvamento de dados no banco
- Upload de imagens para Storage
- Políticas de segurança (RLS)
- Validação de usuário logado

✅ **Interface de usuário**
- Loading state durante envio
- Mensagens de sucesso/erro
- Preview de imagens
- Formulário responsivo

## Próximos passos (opcionais):

- [ ] Criar página para listar produtos do usuário
- [ ] Implementar edição de produtos
- [ ] Adicionar sistema de favoritos
- [ ] Implementar busca e filtros
- [ ] Adicionar notificações por email
- [ ] Criar dashboard administrativo

## Troubleshooting:

**Erro de URL inválida do Supabase:**
- Verifique se as variáveis no `.env.local` estão corretas
- Reinicie o servidor após alterar as variáveis

**Erro de permissão no banco:**
- Verifique se as políticas RLS foram criadas corretamente
- Confirme se o usuário está autenticado

**Erro no upload de imagens:**
- Verifique se o bucket `product-images` foi criado
- Confirme se está marcado como público
- Verifique as políticas de storage