# 🔍 Auditoria Completa - Digital RSVP App

> **Data**: 26 Janeiro 2026  
> **Objetivo**: MVP coerente e coeso aplicando DRY, SOLID, YAGNI  
> **Branch**: development  
> **Última Atualização**: 26 Janeiro 2026

---

## 📊 Resumo Executivo

### Principais Problemas Identificados

| Categoria | Qtd | Impacto |
|-----------|-----|---------|
| Violações DRY (código duplicado) | 5 | 🔴 Alto |
| Inconsistências de Dados | 3 | 🔴 Alto |
| Violações SOLID | 4 | 🟡 Médio |
| YAGNI (código não usado) | 3 | 🟢 Baixo |
| UX/Funcionalidade incompleta | 4 | 🟡 Médio |

### Progresso

| Issue | Status | Data |
|-------|--------|------|
| ISSUE-001 | ✅ Resolvido | 26/01/2026 |
| ISSUE-002 | ⏳ Pendente | - |
| ISSUE-003 | ⏳ Pendente | - |

---

## 🔴 PRIORIDADE CRÍTICA (P0) - Bloqueia MVP

### ✅ ISSUE-001: Unificar Preview e RSVP - Violação DRY Crítica

**Status**: ✅ **RESOLVIDO**

**Solução Implementada**:
- Criado `InvitationCardComponent` em `src/app/components/invitation-card/`
- Criado `DietarySelectComponent` em `src/app/components/dietary-select/`
- Criado `src/app/utils/` com `date.utils.ts` e `event.utils.ts`
- Criado `src/app/models/dietary.model.ts` com `DIETARY_OPTIONS`
- Refatorado `invitation-preview.page` para usar componentes partilhados
- Refatorado `rsvp.page` para usar componentes partilhados
- SCSS reduzido de ~1600 linhas (ambas páginas) para ~500 linhas

**Métricas de Melhoria**:
| Chunk | Antes | Depois | Redução |
|-------|-------|--------|---------|
| invitation-preview-page | 63.65 kB | 19.47 kB | **-69%** |
| rsvp-page | 37.98 kB | 22.23 kB | **-41%** |
| Chunk partilhado (novo) | - | 26.21 kB | Reutilizado |

**Ficheiros Criados**:
- `src/app/components/invitation-card/invitation-card.component.ts`
- `src/app/components/invitation-card/invitation-card.component.html`
- `src/app/components/invitation-card/invitation-card.component.scss`
- `src/app/components/dietary-select/dietary-select.component.ts`
- `src/app/components/index.ts`
- `src/app/utils/date.utils.ts`
- `src/app/utils/event.utils.ts`
- `src/app/utils/index.ts`
- `src/app/models/dietary.model.ts`

---

### ISSUE-002: Modelo de Dados Inconsistente - children vs childrenNames

**Status**: ⏳ Pendente

**Problema**: Dois campos para a mesma informação:
```typescript
// Em Invitation (event.model.ts linha 47-48)
childrenNames?: string[];      // ❌ Legacy, deprecated
children?: InvitedChild[];     // ✅ Novo formato
```

**Impacto**:
- invitation-form-modal.component.ts guarda ambos para "backwards compatibility"
- API não valida qual usar
- RSVP page usa `childrenNames` em vez de `children`

**Solução**:
1. Remover `childrenNames` do modelo (breaking change)
2. Migração única na API para converter dados existentes
3. Atualizar todos os ficheiros para usar apenas `children: InvitedChild[]`

**Esforço**: 2-3h

---

### ISSUE-003: RSVP Não Pede Idade dos Filhos

**Status**: ⏳ Pendente

**Problema**: Se o Host não preencher a idade no convite, o RSVP não pergunta.

**Spec** (de FEATURES-SPEC.md):
> "Idade dos filhos - Se Host não preencheu: ❌ Por implementar"

**Ficheiros Afetados**:
- [rsvp.page.html](../src/app/pages/rsvp/rsvp.page.html) - falta secção para pedir idades
- [rsvp.page.ts](../src/app/pages/rsvp/rsvp.page.ts) - falta lógica

**Solução**:
```html
<!-- No rsvp.page.html, dentro da secção de filhos -->
@if (hasChildrenWithoutAge()) {
  <div class="children-ages">
    <label>Idades dos filhos:</label>
    @for (child of childrenWithoutAge(); track $index) {
      <ion-item>
        <ion-input 
          type="number" 
          [label]="child.name"
          [(ngModel)]="childAges[$index]"
          placeholder="Idade">
        </ion-input>
      </ion-item>
    }
  </div>
}
```

**Esforço**: 1-2h

---

## 🟡 PRIORIDADE ALTA (P1) - Importante para MVP

### ISSUE-004: Opções de Restrições Alimentares Duplicadas

**Problema**: Lista de opções hardcoded em 4 locais diferentes:

| Ficheiro | Linhas | Opções |
|----------|--------|--------|
| rsvp.page.html | 185-196, 239-250, 301-312, 343-354 | 10 opções |
| invitation-preview.page.html | 285-294, 306-315, 340-349, 393-402 | 6 opções (menos!) |

**Inconsistência**: RSVP tem mais opções (Halal, Kosher, alergias específicas) que o Preview!

**Solução**:
```typescript
// Criar em models/dietary.model.ts
export const DIETARY_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Sem glúten' },
  { value: 'lactose-free', label: 'Sem lactose' },
  { value: 'nut-allergy', label: 'Alergia a frutos secos' },
  { value: 'seafood-allergy', label: 'Alergia a marisco' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'other', label: 'Outras' },
] as const;

// Ou melhor: componente DietarySelectComponent
```

**Esforço**: 1h

---

### ISSUE-005: Serviços com Responsabilidade Mista (Violação SRP)

**Problema**: `GuestService` tem métodos que não são CRUD de convidados:
- `exportToCSV()` - deveria estar num `ExportService`
- `getGuestStats()` - deveria estar num `StatsService` ou computed no componente

**Ficheiro**: [guest.service.ts](../src/app/services/guest.service.ts#L170-L220)

**Solução** (para MVP, baixa prioridade):
- Manter como está para MVP
- Refatorar depois em serviços especializados

**Esforço**: 2h (post-MVP)

---

### ISSUE-006: Funções Utilitárias Duplicadas

**Problema**: Mesmas funções em múltiplos componentes:

| Função | invitation-preview | rsvp | event-detail |
|--------|-------------------|------|--------------|
| `formatDate()` | ✅ | ✅ | ✅ |
| `getMonogram()` | ✅ | ✅ | ❌ |
| `getThemeColor()` | ✅ | ✅ | ❌ |
| `getTimeLabel()` | ✅ | ✅ | ❌ |
| `getDisplayDate()` | ✅ | ✅ | ❌ |

**Solução**:
```typescript
// Criar src/app/utils/date.utils.ts
export function formatDatePT(dateStr: string): string { ... }
export function getTimeLabel(event: Event): string | null { ... }

// Criar src/app/utils/event.utils.ts
export function getMonogram(event: Event): string { ... }
export function getThemeColor(theme: InvitationTheme): string { ... }
```

**Esforço**: 1h

---

### ISSUE-007: CSS Budget Warning no Preview

**Problema**: Build warning:
> Budget warning: 17.16 kB vs 15.36 kB limit

**Ficheiro**: [invitation-preview.page.scss](../src/app/pages/invitation-preview/invitation-preview.page.scss) - 1066 linhas!

**Causa**: CSS duplicado com rsvp.page.scss + estilos não usados

**Solução**: Resolver com ISSUE-001 (componentes partilhados) + auditar estilos não usados

**Esforço**: Incluído no ISSUE-001

---

## 🟢 PRIORIDADE MÉDIA (P2) - Melhorias de Qualidade

### ISSUE-008: InvitationType 'group' Não Implementado (YAGNI?)

**Problema**: O tipo `group` existe no modelo mas não tem UI diferenciada:

```typescript
// event.model.ts
export type InvitationType = 
  | "single" 
  | "single-plus-one" 
  | "couple" 
  | "family" 
  | "group";  // ← Sem implementação específica
```

**Decisão Necessária**:
- **Remover** se não for necessário para MVP (YAGNI)
- **Implementar** se for requisito

**Esforço**: 0h (remover) ou 3h (implementar)

---

### ISSUE-009: Código Legacy no Modelo Invitation

**Problema**: Campos marcados como deprecated ainda existem:

```typescript
// event.model.ts linha 47
childrenNames?: string[]; // Nomes dos filhos (legacy, deprecated)
```

**Solução**: Após ISSUE-002, remover completamente do modelo.

**Esforço**: 0.5h

---

### ISSUE-010: API Lookup de Código Ineficiente

**Problema**: [api/invitations/code/[code].ts](../api/invitations/code/[code].ts#L35-45) faz duas queries para encontrar evento:

```typescript
const event =
  (await eventsCollection.findOne({ _id: invitation.eventId })) ||
  (await eventsCollection.findOne({ id: invitation.eventId }));
```

**Causa**: Inconsistência entre `_id` e `id` no storage

**Solução**: Normalizar para usar sempre ObjectId como `_id` e converter para `id` apenas no response.

**Esforço**: 1h

---

### ISSUE-011: Falta Validação no API de Invitations

**Problema**: [api/invitations/index.ts](../api/invitations/index.ts#L34-48) não valida dados de entrada:

```typescript
case "POST": {
  const invitationData = req.body;  // ❌ Sem validação
  // ...
}
```

**Riscos**:
- Dados incompletos/inválidos na DB
- eventId pode não existir
- primaryGuest.name pode estar vazio

**Solução**: Adicionar validação básica ou usar Zod

**Esforço**: 1-2h

---

## 🔵 PRIORIDADE BAIXA (P3) - Nice to Have

### ISSUE-012: Temas Podem Ter CSS Incompleto

**Problema**: 7 temas definidos mas estilos podem variar:
- elegant, floral, romantic, rustic, modern, tropical, classic

**Verificação Necessária**: Testar cada tema visualmente

**Esforço**: 2h (testing + fixes)

---

### ISSUE-013: Falta Loading States em Algumas Páginas

**Problema**: Algumas páginas não mostram spinner durante load:
- invitations.page - ✅ Tem
- rsvp.page - ❌ Não tem (se API demora, fica em branco)

**Esforço**: 0.5h

---

### ISSUE-014: Console.error em Produção

**Problema**: Múltiplos `console.error()` nos serviços que vão para produção.

**Solução**: Criar logger service que só loga em dev.

**Esforço**: 1h (post-MVP)

---

## 📋 Roadmap MVP Proposto

### Sprint 1: Fundação (8-10h)
1. ⬜ ISSUE-001: Componentes partilhados (Preview/RSVP)
2. ⬜ ISSUE-002: Unificar modelo children

### Sprint 2: Funcionalidade (4-5h)
3. ⬜ ISSUE-003: Pedir idade filhos no RSVP
4. ⬜ ISSUE-004: Componente DietarySelect
5. ⬜ ISSUE-006: Utils partilhados

### Sprint 3: Qualidade (3-4h)
6. ⬜ ISSUE-010: Fix API lookup
7. ⬜ ISSUE-011: Validação API
8. ⬜ ISSUE-008: Decisão sobre 'group' type

### Post-MVP
9. ⬜ ISSUE-005: Separar serviços
10. ⬜ ISSUE-012: Testar todos os temas
11. ⬜ ISSUE-014: Logger service

---

## 🏗️ Estrutura Proposta Após Refactoring

```
src/app/
├── components/                    # 🆕 Componentes partilhados
│   ├── invitation-card/           # Visual do convite
│   ├── rsvp-form/                 # Formulário RSVP
│   ├── dietary-select/            # Select restrições
│   ├── envelope/                  # Animação envelope
│   └── index.ts                   # Barrel export
├── utils/                         # 🆕 Funções utilitárias
│   ├── date.utils.ts
│   ├── event.utils.ts
│   └── index.ts
├── models/
│   ├── event.model.ts
│   ├── guest.model.ts
│   ├── dietary.model.ts           # 🆕 Opções alimentares
│   └── index.ts
├── services/                      # Sem mudanças para MVP
├── pages/
│   ├── invitation-preview/        # Simplificado (usa components/)
│   ├── rsvp/                      # Simplificado (usa components/)
│   └── ...
└── guards/
```

---

## ✅ Checklist de Verificação

Antes de considerar MVP pronto:

- [ ] Preview e RSVP partilham componentes
- [ ] Modelo `children` é único (sem `childrenNames`)
- [ ] RSVP pede idade se não preenchida
- [ ] Opções alimentares consistentes
- [ ] Todos os 7 temas funcionam visualmente
- [ ] API valida dados de entrada
- [ ] Zero console.error em happy path
- [ ] Build sem warnings de budget

---

*Documento gerado automaticamente durante auditoria de código.*
