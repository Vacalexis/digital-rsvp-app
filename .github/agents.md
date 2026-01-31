# 🤖 Agent Configuration - Digital RSVP App

> **Purpose**: Centralized instructions for AI coding agents working on this project.
> **Last Updated**: 31 Janeiro 2026

---

## 🎯 Mission Statement

You are working on **Digital RSVP App** - an MVP for digital wedding/event invitations with RSVP management. The goal is to **ship a polished, functional MVP quickly** while maintaining code quality.

### Core Values
1. **Ship Fast, Ship Clean** - MVP first, perfect later
2. **DRY** - Don't Repeat Yourself (consolidate duplications)
3. **SOLID** - Single responsibility, clean interfaces
4. **YAGNI** - You Ain't Gonna Need It (remove unused code)

---

## 🏗️ Project Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Ionic 8 + Angular 18 (standalone components) |
| State | Angular Signals |
| Backend | Vercel Serverless Functions (TypeScript) |
| Database | MongoDB Atlas |
| Deploy | Vercel (branch: `development`) |

### Key Directories
```
src/app/
├── components/          # Reusable UI components
├── models/              # TypeScript interfaces
├── services/            # Business logic (API calls)
├── pages/               # Route components
├── guards/              # Auth guards
└── utils/               # Pure utility functions

api/                     # Vercel serverless functions
├── events/              # Event CRUD endpoints
├── guests/              # Guest CRUD endpoints
├── invitations/         # Invitation endpoints
└── lib/mongodb.ts       # DB connection singleton
```

### UI Language
**All user-facing text MUST be in Portuguese (PT-PT).**

---

## 📋 Current MVP Status

### Implemented ✅
- Event CRUD with MongoDB persistence
- Guest management
- Invitation creation and sharing
- RSVP public form
- Themed invitation cards (7 themes)
- Basic authentication

### In Progress 🔄
- Fixing `children` vs `childrenNames` data model inconsistency
- Children age input on RSVP form
- Envelope animation polish

### Not Started ❌ (Post-MVP)
- Email/SMS notifications
- QR code generation
- PDF export
- Multi-user authentication

---

## ⚡ Quick Reference

### Commands
```bash
npm start          # Dev server (localhost:4200)
npm run build      # Production build
vercel dev         # Local API + frontend (localhost:3000)
```

### Important Files
| File | Purpose |
|------|---------|
| `src/app/models/event.model.ts` | Event, Invitation interfaces |
| `src/app/models/guest.model.ts` | Guest interface |
| `src/app/services/event.service.ts` | Event API calls |
| `src/app/services/invitation.service.ts` | Invitation API calls |
| `src/app/components/invitation-card/` | Shared invitation display |
| `api/lib/mongodb.ts` | MongoDB connection |

### Design Tokens (CSS Variables)
| Purpose | Variable | Hex |
|---------|----------|-----|
| Primary | `--ion-color-primary` | `#8b5a5a` (rose) |
| Secondary | `--ion-color-secondary` | `#c9a962` (gold) |
| Confirmed | `--ion-color-success` | `#5a8b5a` |
| Pending | `--ion-color-warning` | `#d4a84b` |
| Declined | `--ion-color-danger` | `#c25050` |
| Background | `--ion-color-light` | `#faf5f0` (cream) |

---

## 🔴 Critical Rules

### DO ✅
1. Use **standalone components** (no NgModules)
2. Use **Angular Signals** for state management
3. Import Ionic components from `@ionic/angular/standalone`
4. Use CSS custom properties (never hardcode colors)
5. Write Portuguese UI text
6. Check for existing utilities in `src/app/utils/` before writing new ones
7. Run `npm run build` after changes to catch errors

### DON'T ❌
1. Never use `BehaviorSubject` when Signals work
2. Never import from `@ionic/angular` (use `/standalone`)
3. Never add `!important` unless absolutely necessary
4. Never hardcode color values
5. Never push to `main` branch (use `development`)
6. Never duplicate code that exists in `components/` or `utils/`

---

## 🧠 Agent Workflow

For ANY task, follow this workflow:

### 1. UNDERSTAND
- Read the issue/request completely
- Check existing code in related files
- Look for existing components/utils that can be reused

### 2. PLAN
Before writing code, document:
```
## Plan
- What files need changes
- What components/utils to reuse
- What new code is needed
- Edge cases to handle
```

### 3. EXECUTE
- Make changes incrementally
- Use existing patterns from the codebase
- Follow naming conventions

### 4. VERIFY
- Run `npm run build`
- Check for TypeScript errors
- Verify no duplicate code was introduced

---

## 📁 Reference Documents

| Document | Purpose |
|----------|---------|
| [FEATURES-SPEC.md](../docs/FEATURES-SPEC.md) | Feature requirements |
| [AUDIT-MVP-ISSUES.md](../issues/AUDIT-MVP-ISSUES.md) | Known issues tracker |
| [copilot-instructions.md](./copilot-instructions.md) | Detailed coding guidelines |
| [AGENT-HANDBOOK.md](../docs/AGENT-HANDBOOK.md) | Patterns and examples |

---

## 🎨 Component Patterns

### Creating a Standalone Component
```typescript
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard } from '@ionic/angular/standalone';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, IonButton, IonCard],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
})
export class MyComponent {
  @Input() data!: SomeType;
  
  // Use signals for local state
  isLoading = signal(false);
  
  // Use computed for derived state
  displayValue = computed(() => this.formatData(this.data));
}
```

### Service Pattern
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MyService {
  private items = signal<Item[]>([]);
  
  // Expose as readonly
  readonly items$ = this.items.asReadonly();
  
  constructor(private http: HttpClient) {}
  
  async loadItems(): Promise<void> {
    const items = await firstValueFrom(
      this.http.get<Item[]>('/api/items')
    );
    this.items.set(items);
  }
}
```

---

## 🐛 Common Issues & Fixes

### "Cannot find module '@ionic/angular/standalone'"
**Fix**: Check imports, ensure using correct import path.

### "Property 'x' does not exist on type 'Event'"
**Fix**: Check `src/app/models/event.model.ts` for correct property names.

### Build budget warning
**Fix**: Check for duplicate CSS, use shared components.

### MongoDB connection issues in dev
**Fix**: Ensure `MONGODB_URI` is set in Vercel environment or `.env`.

---

## 📞 Escalation

If you encounter:
- Security vulnerabilities → Document and flag immediately
- Breaking API changes → Require explicit confirmation
- Unclear requirements → Ask for clarification before proceeding
