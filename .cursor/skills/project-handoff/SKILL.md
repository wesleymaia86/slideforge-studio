---
description: Compacta o estado atual do projeto em documento de handoff para outro agente ou sessão. Use quando o usuário pedir handoff, transferência de contexto ou continuação em nova sessão.
---

# Project Handoff

## Quando usar

- Fim de sessão longa com trabalho incompleto.
- Troca de agente ou desenvolvedor.
- Necessidade de retomar contexto sem reler todo o repositório.

## Formato do documento

Gerar `docs/handoff-YYYY-MM-DD.md` com:

```markdown
# Handoff — [data]

## Objetivo atual
[1–2 frases]

## Concluído
- Item 1
- Item 2

## Em progresso
- Item + estado + arquivos tocados

## Pendente
- Próximos passos ordenados

## Decisões tomadas
- Decisão + rationale breve

## Riscos / blockers
- Risco ou dependência externa

## Arquivos-chave
- `path/to/file` — por quê importa

## Como validar
- Comandos ou passos para verificar estado
```

## Regras

- Objetivo e factual; sem repetir código inteiro.
- Incluir comandos exatos para retomar (install, test, run).
- Atualizar ou substituir handoff anterior se obsoleto.
