# Create Angular/Ionic Component

You are creating a new component for the Digital RSVP App.

## Component Structure

All components MUST follow the standalone pattern:

```typescript
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import ONLY the Ionic components you need, from standalone
import { IonButton, IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    // ... other imports
  ],
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss'],
})
export class ComponentNameComponent {
  // Inputs from parent
  @Input() requiredInput!: SomeType;
  @Input() optionalInput?: string;
  
  // Outputs to parent
  @Output() actionEvent = new EventEmitter<SomePayload>();
  
  // Local state with signals
  isLoading = signal(false);
  
  // Derived state with computed
  displayValue = computed(() => this.formatValue(this.requiredInput));
  
  // Methods
  onAction(): void {
    this.actionEvent.emit({ /* payload */ });
  }
}
```

## File Naming
- Folder: `src/app/components/component-name/`
- Files:
  - `component-name.component.ts`
  - `component-name.component.html`
  - `component-name.component.scss`

## Barrel Export
After creating, add to `src/app/components/index.ts`:
```typescript
export * from './component-name/component-name.component';
```

## SCSS Guidelines

```scss
// Use :host for component-level styles
:host {
  display: block;
  // Component-specific CSS variables
  --component-padding: 16px;
}

// Use Ionic CSS custom properties
ion-button {
  --background: var(--ion-color-primary);
  --color: white;
}

// Theme-aware styling
:host-context(.theme-elegant) {
  // Elegant theme overrides
}

// NEVER use !important
// NEVER hardcode colors - use var(--ion-color-xxx)
```

## Template Guidelines

```html
<!-- Use @if for conditionals (Angular 17+ syntax) -->
@if (isLoading()) {
  <ion-spinner></ion-spinner>
} @else {
  <div class="content">
    {{ displayValue() }}
  </div>
}

<!-- Use @for for loops -->
@for (item of items(); track item.id) {
  <app-item [data]="item"></app-item>
}

<!-- All text in Portuguese -->
<ion-button>Guardar</ion-button>  <!-- NOT "Save" -->
```

## Checklist Before Completing
- [ ] Component is standalone (no NgModule)
- [ ] Ionic imports from `@ionic/angular/standalone`
- [ ] Uses signals for state
- [ ] Added to barrel export
- [ ] SCSS uses CSS variables
- [ ] All text is Portuguese
- [ ] Build passes
