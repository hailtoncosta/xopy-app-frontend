# Implementation Plan - Gerenciamento de Loja do Vendedor

- [x] 1. Criar infraestrutura de banco de dados



  - Criar tabela `seller_stores` com campos necessários
  - Adicionar índices para performance em `products` e `seller_stores`
  - Configurar RLS policies para segurança
  - Configurar bucket de storage para logos





  - _Requirements: 1.1, 1.2, 7.1, 7.2_

- [ ] 2. Implementar service layer para gerenciamento de loja
  - [x] 2.1 Criar arquivo `src/services/sellerStoreService.ts`

    - Implementar função `getStoreConfig()` para buscar configuração da loja
    - Implementar função `upsertStore()` para criar/atualizar loja
    - Implementar função `uploadLogo()` para upload de imagem
    - _Requirements: 1.2, 7.1_
  

  - [ ] 2.2 Implementar funções de gerenciamento de produtos
    - Implementar função `getSellerProducts()` para listar produtos do vendedor
    - Implementar função `toggleProductStatus()` para ativar/desativar produtos
    - Implementar função `updateProduct()` para editar produto





    - _Requirements: 2.1, 2.2, 3.2, 4.1_
  
  - [ ] 2.3 Implementar função de estatísticas
    - Implementar função `getSellerStats()` para calcular métricas

    - Buscar total de produtos ativos

    - Buscar total de vendas completadas
    - Calcular avaliação média (placeholder por enquanto)
    - _Requirements: 6.1, 6.2, 6.4_


- [ ] 3. Criar componentes de UI para configuração da loja
  - [-] 3.1 Criar componente `StoreConfigSection`






    - Criar formulário com campos: business_name, description, address, city, state, phone
    - Implementar validações de campos obrigatórios e limites de caracteres
    - Adicionar feedback visual de loading e sucesso/erro
    - _Requirements: 1.1, 1.2, 1.4_

  
  - [ ] 3.2 Criar componente `LogoUpload`
    - Implementar área de drag-and-drop para upload
    - Validar formato (PNG, JPG, JPEG) e tamanho (máx 2MB)
    - Mostrar preview da imagem antes de salvar
    - Implementar compressão de imagem se necessário

    - _Requirements: 1.3_
  
  - [ ] 3.3 Criar componente `StatsSection`
    - Criar cards para exibir: total de produtos, total de vendas, avaliação média
    - Implementar loading state enquanto busca dados

    - Mostrar mensagem "Sem dados ainda" quando não houver estatísticas
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Criar página MyListings para vendedores
  - [ ] 4.1 Criar estrutura base da página `src/pages/MyListings.tsx`
    - Implementar layout com header, sidebar e conteúdo principal
    - Adicionar navegação de volta
    - Implementar estados de loading
    - _Requirements: 2.1_
  
  - [ ] 4.2 Integrar seção de configuração da loja
    - Renderizar `StoreConfigSection` e `LogoUpload`
    - Implementar lógica de salvar configurações
    - Buscar dados existentes ao carregar página
    - Mostrar valores padrão se loja não configurada
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ] 4.3 Integrar seção de estatísticas
    - Renderizar `StatsSection`
    - Buscar e exibir estatísticas do vendedor
    - Atualizar estatísticas após ações (criar/editar produto)
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ] 4.4 Criar seção de listagem de produtos
    - Implementar grid/lista de produtos do vendedor
    - Mostrar: imagem, título, preço, status, data de criação
    - Adicionar botões de ação: editar, ativar/desativar
    - Implementar paginação (10 produtos por página)
    - Mostrar mensagem "Nenhum produto anunciado" quando vazio
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Implementar funcionalidade de edição de produtos
  - [ ] 5.1 Criar modal/página de edição de produto
    - Criar formulário com todos os campos do produto
    - Pré-preencher com dados atuais do produto
    - Implementar validações de campos
    - _Requirements: 3.1, 3.2_
  
  - [ ] 5.2 Implementar lógica de salvar alterações
    - Validar dados antes de enviar
    - Atualizar produto no banco de dados
    - Mostrar feedback de sucesso/erro
    - Atualizar lista de produtos após salvar
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 5.3 Implementar toggle de status ativo/inativo



    - Adicionar switch/toggle em cada produto
    - Implementar lógica de ativar/desativar
    - Validar se produto tem pedidos pendentes antes de desativar
    - Mostrar feedback visual imediato
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Atualizar página SellerProfile (perfil público)
  - [ ] 6.1 Atualizar função de carregamento de dados
    - Buscar dados de `seller_stores` ao invés de dados mockados
    - Buscar produtos ativos do vendedor
    - Calcular estatísticas (vendas, avaliação)
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 6.2 Atualizar UI do perfil público
    - Exibir logo da loja (ou fallback)
    - Exibir nome da empresa, descrição, localização
    - Exibir estatísticas (produtos, vendas, avaliação)
    - Listar produtos ativos do vendedor
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ] 6.3 Implementar fallback para lojas não configuradas
    - Mostrar informações básicas quando loja não configurada
    - Usar nome do usuário como fallback
    - Mostrar ícone padrão se não houver logo
    - _Requirements: 5.4_

- [ ] 7. Adicionar navegação e integração com sidebar
  - Atualizar sidebar para destacar "Meus Anúncios"
  - Garantir que rota `/my-listings` está configurada
  - Adicionar link de "Meus Anúncios" no menu do usuário
  - Implementar proteção de rota (apenas usuários autenticados)
  - _Requirements: 2.1_

- [ ] 8. Implementar validações e tratamento de erros
  - Adicionar validações de formulário em todos os inputs
  - Implementar mensagens de erro claras e específicas
  - Adicionar tratamento de erros de rede
  - Implementar retry logic para operações críticas
  - _Requirements: 1.2, 3.2, 4.4_

- [ ] 9. Otimizar performance
  - Implementar cache de perfil público (5 minutos)
  - Adicionar lazy loading de imagens
  - Implementar debounce em buscas/filtros
  - Otimizar queries com índices apropriados
  - _Requirements: 5.3, 6.5_

- [ ] 10. Testes e ajustes finais
  - Testar fluxo completo de configuração de loja
  - Testar edição e ativação/desativação de produtos
  - Testar visualização do perfil público
  - Verificar responsividade em mobile e desktop
  - Ajustar UI/UX baseado em feedback
  - _Requirements: Todos_
