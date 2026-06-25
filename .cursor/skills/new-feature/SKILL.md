---
description: Implementação de novas features seguindo arquitetura em camadas. Use quando o usuário pedir nova funcionalidade, feature, endpoint ou módulo.
---

# New Feature

## Checklist

```
- [ ] Caso de uso definido
- [ ] Entidades/regras mapeadas em domain/
- [ ] Contratos (types/interfaces) criados
- [ ] Serviço de aplicação em app/
- [ ] Adaptadores em infra/ (se houver IO)
- [ ] Exposição em interfaces/
- [ ] Testes: happy path, borda, falha
- [ ] Docs atualizadas se impacto estrutural
```

## Ordem de implementação

1. **Domain** — entidades, value objects, regras puras.
2. **App** — caso de uso que orquestra o domínio.
3. **Infra** — persistência, APIs, filas (implementa portas do domínio).
4. **Interfaces** — HTTP, CLI, jobs que chamam o caso de uso.
5. **Tests** — unitários no domain/app; integração nos fluxos completos.

## Anti-patterns

- Regra de negócio em controller ou componente UI.
- Acesso direto a DB/API a partir de interfaces.
- `Manager`, `Helper`, `Utils` genéricos sem contexto de domínio.
