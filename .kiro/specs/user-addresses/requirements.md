# Requirements Document - Gerenciamento de Endereços do Usuário

## Introduction

Esta funcionalidade permite que usuários gerenciem seus endereços de entrega no marketplace Xopy. Os usuários poderão adicionar, editar, excluir e definir endereços padrão. Quando um usuário faz uma compra e informa um endereço no checkout, esse endereço é automaticamente salvo no perfil para uso futuro.

## Requirements

### Requirement 1: Cadastro de Endereços

**User Story:** Como usuário, eu quero cadastrar múltiplos endereços de entrega, para que eu possa escolher onde receber meus pedidos.

#### Acceptance Criteria

1. WHEN o usuário acessa "Endereços" THEN o sistema SHALL exibir lista de endereços cadastrados
2. WHEN o usuário clica em "Adicionar Endereço" THEN o sistema SHALL abrir formulário de cadastro
3. WHEN o usuário preenche dados do endereço THEN o sistema SHALL validar campos obrigatórios
4. WHEN o usuário salva endereço THEN o sistema SHALL armazenar no banco de dados
5. IF for o primeiro endereço THEN o sistema SHALL marcar como padrão automaticamente

### Requirement 2: Edição de Endereços

**User Story:** Como usuário, eu quero editar meus endereços cadastrados, para que eu possa manter informações atualizadas.

#### Acceptance Criteria

1. WHEN o usuário clica em "Editar" em um endereço THEN o sistema SHALL abrir formulário preenchido
2. WHEN o usuário modifica informações THEN o sistema SHALL validar campos
3. WHEN o usuário salva alterações THEN o sistema SHALL atualizar no banco de dados
4. WHEN endereço é atualizado THEN o sistema SHALL exibir mensagem de sucesso
5. IF endereço está vinculado a pedidos THEN o sistema SHALL manter histórico

### Requirement 3: Exclusão de Endereços

**User Story:** Como usuário, eu quero excluir endereços que não uso mais, para que minha lista fique organizada.

#### Acceptance Criteria

1. WHEN o usuário clica em "Excluir" THEN o sistema SHALL solicitar confirmação
2. WHEN o usuário confirma exclusão THEN o sistema SHALL remover do banco de dados
3. WHEN endereço é excluído THEN o sistema SHALL atualizar lista
4. IF endereço é padrão THEN o sistema SHALL definir outro como padrão automaticamente
5. IF endereço tem pedidos pendentes THEN o sistema SHALL impedir exclusão

### Requirement 4: Endereço Padrão

**User Story:** Como usuário, eu quero definir um endereço como padrão, para que ele seja selecionado automaticamente no checkout.

#### Acceptance Criteria

1. WHEN o usuário marca endereço como padrão THEN o sistema SHALL desmarcar outros
2. WHEN usuário acessa checkout THEN o sistema SHALL pré-selecionar endereço padrão
3. WHEN primeiro endereço é cadastrado THEN o sistema SHALL marcar como padrão automaticamente
4. WHEN endereço padrão é excluído THEN o sistema SHALL definir outro como padrão
5. IF usuário tem apenas um endereço THEN o sistema SHALL sempre usá-lo como padrão

### Requirement 5: Integração com Checkout

**User Story:** Como usuário, eu quero que o endereço informado no checkout seja salvo automaticamente, para que eu não precise cadastrá-lo novamente.

#### Acceptance Criteria

1. WHEN usuário finaliza compra com endereço THEN o sistema SHALL verificar se endereço já existe
2. WHEN endereço não existe THEN o sistema SHALL salvar automaticamente no perfil
3. WHEN endereço é salvo do checkout THEN o sistema SHALL marcar como padrão se for o primeiro
4. WHEN usuário tem endereços cadastrados THEN o sistema SHALL permitir selecionar ou adicionar novo
5. IF endereço do checkout é similar a existente THEN o sistema SHALL perguntar se deseja atualizar

### Requirement 6: Busca de CEP

**User Story:** Como usuário, eu quero buscar endereço por CEP, para que o preenchimento seja mais rápido.

#### Acceptance Criteria

1. WHEN usuário informa CEP THEN o sistema SHALL buscar dados na API ViaCEP
2. WHEN CEP é encontrado THEN o sistema SHALL preencher rua, bairro, cidade e estado automaticamente
3. WHEN CEP não é encontrado THEN o sistema SHALL exibir mensagem e permitir preenchimento manual
4. WHEN dados são preenchidos THEN o sistema SHALL manter número e complemento editáveis
5. IF API falhar THEN o sistema SHALL permitir preenchimento manual completo

### Requirement 7: Tipos de Endereço

**User Story:** Como usuário, eu quero categorizar meus endereços (Casa, Trabalho, Outro), para que eu possa identificá-los facilmente.

#### Acceptance Criteria

1. WHEN usuário cadastra endereço THEN o sistema SHALL permitir selecionar tipo
2. WHEN tipo é selecionado THEN o sistema SHALL exibir ícone correspondente
3. WHEN usuário visualiza lista THEN o sistema SHALL mostrar tipo de cada endereço
4. WHEN tipo é "Outro" THEN o sistema SHALL permitir label personalizado
5. IF usuário não selecionar tipo THEN o sistema SHALL usar "Outro" como padrão

## Edge Cases and Considerations

- Usuário sem endereços deve ver interface vazia com call-to-action
- CEP deve ser validado (formato 00000-000)
- Endereço padrão não pode ser desmarcado, apenas trocado
- Ao excluir endereço padrão, o mais recente deve se tornar padrão
- Endereços com pedidos em andamento não podem ser excluídos
- API ViaCEP pode estar indisponível, permitir preenchimento manual
- Validar campos obrigatórios antes de salvar
- Limitar número de endereços por usuário (ex: máximo 10)

## Success Criteria

- Usuário consegue cadastrar endereço em menos de 1 minuto
- Busca de CEP funciona em 90% dos casos
- Endereço do checkout é salvo automaticamente
- Interface é responsiva e funciona em mobile
- Todas as operações têm feedback visual claro
