# Refactoring Task

You are refactoring code in the Digital RSVP App. Apply DRY, SOLID, and YAGNI principles.

## Refactoring Principles

### DRY (Don't Repeat Yourself)
- Identify duplicated code across files
- Extract to shared components or utils
- Single source of truth for data/logic

### SOLID
- **S**ingle Responsibility: One purpose per class/function
- **O**pen/Closed: Extend without modifying
- **L**iskov Substitution: Subtypes are substitutable
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions

### YAGNI (You Ain't Gonna Need It)
- Remove unused code
- Don't add features "just in case"
- Simplify over-engineered solutions

## Refactoring Workflow

### 1. AUDIT
- Identify the code smell or duplication
- List all locations where it appears
- Understand current behavior completely

### 2. PLAN
Document your approach:
```markdown
## Refactoring Plan
- **Problem**: [describe the issue]
- **Locations**: [list files/lines]
- **Solution**: [describe the approach]
- **New Files**: [if any]
- **Migration**: [breaking changes?]
```

### 3. EXTRACT
Create the shared abstraction:
- For repeated UI → Create component in `src/app/components/`
- For repeated logic → Create util in `src/app/utils/`
- For repeated data → Create constant in `src/app/models/`

### 4. REPLACE
Update all original locations to use the new abstraction.

### 5. VERIFY
- Run `npm run build`
- Ensure all usages work correctly
- Check bundle size if relevant

## Common Refactoring Patterns

### Extract Component
```typescript
// Before: Repeated HTML/logic in multiple pages
// After: Shared component

// src/app/components/status-badge/status-badge.component.ts
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [IonBadge],
  template: `
    <ion-badge [color]="statusConfig[status].color">
      {{ statusConfig[status].label }}
    </ion-badge>
  `,
})
export class StatusBadgeComponent {
  @Input() status!: RsvpStatus;
  statusConfig = RSVP_STATUS_CONFIG;
}
```

### Extract Utility Function
```typescript
// Before: Same function in multiple components
// After: Shared utility

// src/app/utils/format.utils.ts
export function formatDatePT(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
```

### Extract Constant
```typescript
// Before: Same array in multiple files
// After: Shared constant

// src/app/models/dietary.model.ts
export const DIETARY_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'vegetarian', label: 'Vegetariano' },
  // ...
] as const;
```

### Remove Dead Code
```typescript
// If code is not used anywhere:
// 1. Search for usages across codebase
// 2. If zero usages, remove it
// 3. If "might be needed later", remove it (YAGNI)
```

## Files to Check for Duplication
- `src/app/pages/invitation-preview/` vs `src/app/pages/rsvp/`
- Multiple components with `formatDate()` methods
- Dietary options hardcoded in templates
- Theme color logic

## Checklist
- [ ] Identified all duplicate locations
- [ ] Created shared abstraction
- [ ] Updated all usages
- [ ] Build passes
- [ ] No breaking changes (or documented)
- [ ] Bundle size same or smaller
