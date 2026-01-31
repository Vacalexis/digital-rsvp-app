# 🤖 Agent Sessions

Esta pasta contém documentação detalhada de sessões de desenvolvimento com agentes IA.

## Propósito

Cada sessão documenta:
- Problemas resolvidos
- Decisões tomadas
- Mudanças implementadas
- Contexto para futuros agentes
- Lições aprendidas

## Como Usar

### Para Agentes IA
Ao trabalhar no projeto:
1. Ler sessões relevantes para contexto
2. Evitar refazer trabalho já feito
3. Entender padrões e decisões anteriores
4. Documentar nova sessão ao completar trabalho significativo

### Para Developers
- **Onboarding**: Ler sessões para entender evolução do projeto
- **Debugging**: Verificar quando/porquê features foram implementadas
- **Arquitetura**: Compreender decisões de design

## Estrutura de Sessão

Cada ficheiro segue template:
```markdown
# Session Overview
- Data, duração, objetivos
- Estado inicial vs final

# Issues Resolved
- Problemas específicos resolvidos
- Causa raiz e solução

# Changes Made
- Ficheiros modificados
- Código adicionado/removido
- Testes realizados

# Key Decisions
- Decisões arquiteturais
- Alternativas consideradas
- Rationale

# Context for Future Agents
- Padrões usados
- Pitfalls evitados
- Guidelines de código
```

## Sessões Disponíveis

| Data | ID | Tópicos | Status |
|------|----|---------|----|
| 2026-01-31 | [SESSION-2026-01-31-gui-fixes-and-staging-protection](./SESSION-2026-01-31-gui-fixes-and-staging-protection.md) | GUI fixes, Schedule feature, Staging auth protection | ✅ Completa |

## Guidelines para Novas Sessões

### Quando Criar
Criar nova sessão quando:
- ✅ Trabalho demora >2 horas
- ✅ Múltiplas features/fixes implementadas
- ✅ Decisões arquiteturais importantes
- ✅ Mudanças que afetam múltiplos componentes

Não criar para:
- ❌ Typo fixes
- ❌ Minor CSS tweaks
- ❌ Single-line changes

### Naming Convention
```
SESSION-YYYY-MM-DD-brief-description.md
```

Exemplos:
- `SESSION-2026-01-31-gui-fixes-and-staging-protection.md`
- `SESSION-2026-02-15-mongodb-integration.md`
- `SESSION-2026-03-10-stripe-payment-flow.md`

### Template
```markdown
# 🤖 Agent Session - DD Mês YYYY

**Session ID**: `SESSION-YYYY-MM-DD-topic`
**Agent**: [Agent Name]
**User**: [User Name]
**Duration**: [X horas]
**Branch**: [branch name]

---

## Session Overview
[Brief summary]

## Issues Resolved
[List of problems fixed]

## Changes Made
[Detailed changelog]

## Key Decisions
[Important decisions and rationale]

## Context for Future Agents
[Patterns, pitfalls, guidelines]

---

**End of Session Document**
```

## Manutenção

- **Atualizar**: Quando adicionar nova sessão, atualizar tabela acima
- **Arquivar**: Após 1 ano, mover para `archive/YYYY/`
- **Revisão**: Quarterly review para manter relevância

## Links Úteis

- [Main README](../../README.md)
- [Agent Handbook](../../docs/AGENT-HANDBOOK.md)
- [Copilot Instructions](../.github/copilot-instructions.md)
- [MVP Plan](../../docs/MVP-IMPLEMENTATION-PLAN.md)

---

*Esta pasta é mantida para facilitar colaboração entre agentes IA e developers humanos.*
