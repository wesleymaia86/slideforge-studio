# AGENTS.md — Guia para agentes de IA

## Objetivo

Este repositório segue arquitetura modular, baixo acoplamento e manutenção previsível. O agente deve agir como engenheiro sênior: soluções simples antes de sofisticadas, consistência entre módulos e zero complexidade sem ganho claro.

## Princípios de arquitetura

- Responsabilidades explícitas por camada.
- Separar interface, aplicação, domínio e infraestrutura.
- Regras de negócio ficam no domínio — nunca em controllers, rotas ou views.
- Integrações externas atrás de adaptadores ou serviços dedicados.
- Dependências apontam para dentro: infra depende do domínio, nunca o contrário.
- Composição sobre herança; testabilidade e observabilidade em toda decisão.

## Estrutura do repositório

```
src/
  app/           # casos de uso, orquestração, serviços de aplicação
  domain/        # entidades, regras, contratos, value objects
  infra/         # banco, APIs, filas, filesystem, provedores
  interfaces/    # rotas, controllers, CLI, jobs, handlers
  shared/        # utilitários realmente compartilhados
tests/
  unit/
  integration/
  e2e/
docs/
  architecture/
  adr/
.cursor/
  rules/         # regras persistentes do Cursor
  skills/        # skills específicas do projeto
  hooks/         # automações de agente
scripts/         # automação de setup e deploy
mcp/             # configuração e docs de servidores MCP
```

## Regras de código

- Legibilidade antes de "código esperto".
- Funções com responsabilidade única e nomes orientados à intenção.
- Sem abstrações prematuras; sem duplicação de regra de negócio.
- Erros com contexto suficiente para diagnóstico.
- Configuração externalizada e validada na borda.
- Segredos nunca hardcoded.

## Padrão para novas features

1. Definir o caso de uso.
2. Mapear entidades e regras afetadas.
3. Criar ou ajustar contratos.
4. Implementar serviço de aplicação.
5. Conectar infraestrutura.
6. Expor via interface adequada.
7. Cobrir cenários principal, borda e falha.
8. Atualizar docs quando houver impacto estrutural.

## Testes

- Regra de negócio → testes unitários.
- Fluxos com dependências → testes de integração.
- Bug corrigido → teste de regressão quando fizer sentido.
- Evitar testes frágeis acoplados à implementação interna.

## Checklist antes de concluir

- [ ] Separação de camadas respeitada?
- [ ] Regra de negócio centralizada?
- [ ] Acoplamento desnecessário com framework?
- [ ] Nomes refletem a linguagem do domínio?
- [ ] Código mais simples de manter do que antes?

## Saída esperada do agente

Ao propor implementação:

1. Explicar rapidamente a abordagem.
2. Listar arquivos criados ou alterados.
3. Apontar riscos ou trade-offs.
4. Manter aderência a este documento e às rules em `.cursor/rules/`.
