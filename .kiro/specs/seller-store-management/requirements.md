# Requirements Document - Gerenciamento de Loja do Vendedor

## Introduction

Esta funcionalidade permite que vendedores gerenciem sua loja no marketplace Xopy. Os vendedores poderão configurar informações da loja (nome, descrição, logo, localização) e visualizar/gerenciar seus anúncios de produtos. A página "Meus Anúncios" na sidebar será transformada em um hub completo de gerenciamento da loja.

## Requirements

### Requirement 1: Configuração do Perfil da Loja

**User Story:** Como vendedor, eu quero configurar as informações da minha loja (nome, descrição, logo, localização), para que compradores possam conhecer melhor meu negócio quando visitarem meu perfil.

#### Acceptance Criteria

1. WHEN o vendedor acessa "Meus Anúncios" THEN o sistema SHALL exibir uma seção "Configurações da Loja" com campos editáveis
2. WHEN o vendedor preenche os dados da loja (nome da empresa, descrição, logo, endereço, cidade, estado) THEN o sistema SHALL salvar essas informações no banco de dados
3. WHEN o vendedor faz upload de um logo THEN o sistema SHALL validar o formato (PNG, JPG, JPEG) e tamanho máximo (2MB)
4. WHEN o vendedor salva as configurações THEN o sistema SHALL exibir mensagem de sucesso e atualizar o perfil público da loja
5. IF o vendedor ainda não configurou a loja THEN o sistema SHALL exibir valores padrão (nome do usuário, sem logo, sem descrição)

### Requirement 2: Visualização de Anúncios do Vendedor

**User Story:** Como vendedor, eu quero visualizar todos os meus produtos anunciados em uma lista organizada, para que eu possa acompanhar meu catálogo.

#### Acceptance Criteria

1. WHEN o vendedor acessa "Meus Anúncios" THEN o sistema SHALL exibir uma lista de todos os produtos cadastrados pelo vendedor
2. WHEN a lista é exibida THEN o sistema SHALL mostrar: imagem, título, preço, status (ativo/inativo), data de criação
3. WHEN o vendedor clica em um produto THEN o sistema SHALL permitir editar ou visualizar detalhes do produto
4. WHEN não há produtos cadastrados THEN o sistema SHALL exibir mensagem "Nenhum produto anunciado" com botão para criar novo anúncio
5. WHEN o vendedor tem muitos produtos THEN o sistema SHALL implementar paginação (10 produtos por página)

### Requirement 3: Edição de Produtos Existentes

**User Story:** Como vendedor, eu quero editar informações dos meus produtos anunciados, para que eu possa manter meu catálogo atualizado.

#### Acceptance Criteria

1. WHEN o vendedor clica em "Editar" em um produto THEN o sistema SHALL abrir formulário com dados atuais do produto
2. WHEN o vendedor modifica informações (título, preço, descrição, imagens, categoria) THEN o sistema SHALL validar os campos
3. WHEN o vendedor salva as alterações THEN o sistema SHALL atualizar o produto no banco de dados
4. WHEN o produto é atualizado THEN o sistema SHALL exibir mensagem de sucesso e retornar para lista de anúncios
5. IF o produto está vinculado a pedidos THEN o sistema SHALL manter histórico de alterações de preço

### Requirement 4: Ativação/Desativação de Produtos

**User Story:** Como vendedor, eu quero ativar ou desativar meus produtos, para que eu possa controlar quais produtos estão visíveis no marketplace.

#### Acceptance Criteria

1. WHEN o vendedor clica em toggle de status de um produto THEN o sistema SHALL alterar status entre ativo/inativo
2. WHEN um produto é desativado THEN o sistema SHALL remover o produto das listagens públicas do marketplace
3. WHEN um produto é reativado THEN o sistema SHALL tornar o produto visível novamente no marketplace
4. WHEN o status é alterado THEN o sistema SHALL exibir feedback visual imediato (toast notification)
5. IF o produto tem pedidos pendentes THEN o sistema SHALL impedir desativação e exibir mensagem explicativa

### Requirement 5: Integração com Perfil Público da Loja

**User Story:** Como comprador, eu quero ver o perfil completo da loja quando clico em "Ver loja" em um produto, para que eu possa conhecer o vendedor e seus outros produtos.

#### Acceptance Criteria

1. WHEN um comprador clica em "Ver loja" em um produto THEN o sistema SHALL exibir página de perfil público da loja
2. WHEN o perfil é exibido THEN o sistema SHALL mostrar: logo, nome da empresa, descrição, localização, avaliação, total de vendas
3. WHEN o perfil é exibido THEN o sistema SHALL listar todos os produtos ativos daquele vendedor
4. WHEN o vendedor não configurou a loja THEN o sistema SHALL exibir informações básicas (nome do usuário, produtos)
5. WHEN o comprador clica em um produto no perfil THEN o sistema SHALL navegar para página de detalhes do produto

### Requirement 6: Estatísticas da Loja

**User Story:** Como vendedor, eu quero ver estatísticas básicas da minha loja (total de produtos, total de vendas, avaliação média), para que eu possa acompanhar o desempenho do meu negócio.

#### Acceptance Criteria

1. WHEN o vendedor acessa "Meus Anúncios" THEN o sistema SHALL exibir cards com estatísticas principais
2. WHEN as estatísticas são exibidas THEN o sistema SHALL mostrar: total de produtos ativos, total de vendas realizadas, avaliação média
3. WHEN não há dados suficientes THEN o sistema SHALL exibir valores zerados ou mensagem "Sem dados ainda"
4. WHEN o vendedor tem vendas THEN o sistema SHALL calcular avaliação média baseada em feedbacks de compradores
5. WHEN as estatísticas são carregadas THEN o sistema SHALL buscar dados em tempo real do banco de dados

### Requirement 7: Armazenamento de Dados da Loja

**User Story:** Como sistema, eu preciso armazenar informações da loja do vendedor de forma estruturada, para que os dados possam ser recuperados e exibidos corretamente.

#### Acceptance Criteria

1. WHEN um vendedor configura sua loja THEN o sistema SHALL salvar dados na tabela `user_profiles` ou criar nova tabela `seller_stores`
2. WHEN os dados são salvos THEN o sistema SHALL incluir: user_id, business_name, description, logo_url, address, city, state, created_at, updated_at
3. WHEN um produto é criado THEN o sistema SHALL vincular automaticamente ao user_id do vendedor na tabela `products`
4. WHEN o perfil público é acessado THEN o sistema SHALL fazer JOIN entre user_profiles/seller_stores e products
5. IF a tabela não existir THEN o sistema SHALL criar estrutura necessária via migration

## Edge Cases and Considerations

- Vendedores sem produtos cadastrados devem ver interface vazia com call-to-action para criar primeiro produto
- Logo da loja deve ter fallback para ícone padrão se não houver upload
- Produtos com pedidos pendentes não podem ser deletados, apenas desativados
- Informações da loja devem ser validadas (nome obrigatório, descrição máximo 500 caracteres)
- Sistema deve suportar múltiplos vendedores acessando simultaneamente
- Cache de perfil público deve ser invalidado quando vendedor atualiza informações

## Success Criteria

- Vendedor consegue configurar loja completa em menos de 3 minutos
- Perfil público da loja carrega em menos de 2 segundos
- Vendedor consegue editar produto existente em menos de 1 minuto
- Interface é responsiva e funciona em mobile e desktop
- Todas as operações têm feedback visual claro (loading, success, error)
