# 📖 Agent Handbook - Digital RSVP App

> **Propósito**: Guia completo para agentes IA trabalharem neste projeto.
> **Última Atualização**: 31 Janeiro 2026

---

## 🎯 Visão Geral do Projeto

### O que é?
Uma aplicação para gestão de convites digitais e RSVPs para eventos (casamentos, batizados, festas). Permite criar convites personalizados, enviar a convidados, e recolher confirmações.

### Fluxo Principal
```
Host cria Evento → Host cria Convites → Convidado recebe link → Convidado faz RSVP → Host vê estatísticas
```

### Stack Técnico
- **Frontend**: Ionic 8 + Angular 18 (standalone components)
- **State**: Angular Signals
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Database**: MongoDB Atlas
- **Deploy**: Vercel (branch: `development`)

---

## 📂 Estrutura do Projeto

### Frontend (`src/app/`)

```
src/app/
├── components/              # Componentes reutilizáveis
│   ├── invitation-card/     # Visualização do convite
│   ├── dietary-select/      # Selector de restrições alimentares
│   ├── envelope-opener/     # Animação do envelope
│   ├── envelope-seal/       # Selo do envelope
│   └── index.ts             # Barrel export
│
├── models/                  # Interfaces TypeScript
│   ├── event.model.ts       # Event, Invitation, InvitedPerson
│   ├── guest.model.ts       # Guest, GuestStats, RsvpStatus
│   ├── dietary.model.ts     # DIETARY_OPTIONS
│   └── index.ts             # Barrel export
│
├── services/                # Lógica de negócio (API calls)
│   ├── event.service.ts     # CRUD de eventos
│   ├── guest.service.ts     # CRUD de convidados
│   ├── invitation.service.ts# CRUD de convites
│   ├── auth.service.ts      # Autenticação
│   └── index.ts             # Barrel export
│
├── pages/                   # Componentes de rota
│   ├── events/              # Lista de eventos (admin)
│   ├── event-detail/        # Dashboard do evento
│   ├── event-form/          # Criar/editar evento
│   ├── invitations/         # Gerir convites
│   ├── invitation-preview/  # Preview do convite (admin)
│   ├── rsvp/                # Formulário RSVP (público)
│   ├── guests/              # Lista de convidados
│   ├── guest-form/          # Criar/editar convidado
│   └── login/               # Página de login
│
├── guards/                  # Route guards
│   └── auth.guard.ts        # Protege rotas admin
│
├── utils/                   # Funções utilitárias
│   ├── date.utils.ts        # Formatação de datas
│   ├── event.utils.ts       # Helpers de evento
│   └── index.ts             # Barrel export
│
├── app.routes.ts            # Configuração de rotas
└── app.component.ts         # Componente raiz
```

### Backend (`api/`)

```
api/
├── events/
│   ├── index.ts             # GET (list), POST (create)
│   └── [id].ts              # GET, PUT, DELETE by ID
│
├── guests/
│   ├── index.ts             # GET (list), POST (create)
│   └── [id].ts              # GET, PUT, DELETE by ID
│
├── invitations/
│   ├── index.ts             # GET (list), POST (create)
│   ├── [id].ts              # GET, PUT, DELETE by ID
│   └── code/
│       └── [code].ts        # GET by share code (público)
│
└── lib/
    └── mongodb.ts           # Conexão singleton MongoDB
```

---

## 🔑 Modelos de Dados

### Event
```typescript
interface Event {
  id: string;
  title: string;                    // "Casamento Ana & João"
  subtitle?: string;                // "Celebrem connosco"
  description?: string;
  eventType: EventType;             // 'wedding' | 'birthday' | etc.
  date: string;                     // ISO date "2026-06-15"
  time?: string;                    // "15:00"
  venue: Venue;                     // { name, address, city, ... }
  hosts: string[];                  // ["Ana Silva", "João Santos"]
  theme: InvitationTheme;           // 'elegant' | 'floral' | etc.
  allowPlusOne: boolean;
  askDietaryRestrictions: boolean;
  askSongRequest: boolean;
  askChildrenInfo: boolean;
  shareCode: string;                // Código único para partilha
  createdAt: string;
  updatedAt: string;
}
```

### Invitation
```typescript
interface Invitation {
  id: string;
  eventId: string;
  invitationType: InvitationType;   // 'single' | 'couple' | 'family'
  shareCode: string;                // Código único DESTE convite
  
  primaryGuest: InvitedPerson;      // { name, email?, phone? }
  secondaryGuest?: InvitedPerson;   // Para casais
  allowPlusOne: boolean;
  children?: InvitedChild[];        // { name, age? }
  
  rsvpSubmitted: boolean;
  rsvpDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Guest
```typescript
interface Guest {
  id: string;
  eventId: string;
  invitationId?: string;
  name: string;
  rsvpStatus: RsvpStatus;           // 'pending' | 'confirmed' | 'declined' | 'maybe'
  dietaryRestrictions?: string;
  plusOne: boolean;
  plusOneName?: string;
  // ... mais campos
}
```

---

## 🎨 Sistema de Design

### Cores (CSS Variables)
```scss
// Usar SEMPRE estas variáveis
--ion-color-primary: #8b5a5a;     // Rose/Burgundy - Ações principais
--ion-color-secondary: #c9a962;   // Gold - Destaques
--ion-color-tertiary: #7d9a7d;    // Sage - Elementos terciários
--ion-color-success: #5a8b5a;     // Green - Confirmado
--ion-color-warning: #d4a84b;     // Gold - Pendente
--ion-color-danger: #c25050;      // Red - Recusado/Erro
--ion-color-light: #faf5f0;       // Cream - Background
--ion-color-dark: #2d2d2d;        // Charcoal - Texto
```

### Temas de Convite
| Tema | Estilo | Decoração Crest |
|------|--------|-----------------|
| elegant | Clássico sofisticado | Ornamentos dourados (★) |
| floral | Flores e natureza | Flores (✿) |
| romantic | Suave e romântico | Corações (♥) |
| rustic | Rústico/campestre | Folhas (❧) |
| modern | Minimalista | Diamantes (◇) |
| tropical | Vibrante/praiano | Sóis (☀) |
| classic | Tradicional | Coroas (♛) |

---

## ✅ Padrões de Código

### Componente Standalone (OBRIGATÓRIO)
```typescript
import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard } from '@ionic/angular/standalone';

@Component({
  selector: 'app-my-component',
  standalone: true,  // ✅ SEMPRE standalone
  imports: [CommonModule, IonButton, IonCard],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
})
export class MyComponent {
  @Input() data!: MyType;
  
  // ✅ Usar signals para estado local
  isLoading = signal(false);
  
  // ✅ Usar computed para estado derivado
  displayName = computed(() => this.data?.name ?? 'N/A');
}
```

### Template Angular 17+ (OBRIGATÓRIO)
```html
<!-- ✅ Usar @if em vez de *ngIf -->
@if (isLoading()) {
  <ion-spinner></ion-spinner>
} @else {
  <div class="content">
    {{ displayName() }}
  </div>
}

<!-- ✅ Usar @for em vez de *ngFor -->
@for (item of items(); track item.id) {
  <app-item [data]="item"></app-item>
} @empty {
  <p>Sem items</p>
}
```

### Serviço com Signals
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  // ✅ Estado privado
  private items = signal<Item[]>([]);
  
  // ✅ Expor como readonly
  readonly items$ = this.items.asReadonly();
  
  // ✅ Computed para filtros
  readonly activeItems = computed(() => 
    this.items().filter(i => i.active)
  );
  
  async load(): Promise<void> {
    const data = await firstValueFrom(this.http.get<Item[]>('/api/items'));
    this.items.set(data);
  }
}
```

### SCSS Guidelines
```scss
// ✅ Usar :host para estilos do componente
:host {
  display: block;
}

// ✅ Usar CSS variables do Ionic
ion-button {
  --background: var(--ion-color-primary);
  --color: white;
}

// ✅ Suporte a temas
:host-context(.theme-elegant) {
  --accent-color: gold;
}

// ❌ NUNCA usar !important
// ❌ NUNCA hardcodar cores (#8b5a5a)
```

---

## ❌ Anti-Padrões (EVITAR)

### 1. Importar do módulo errado
```typescript
// ❌ ERRADO
import { IonButton } from '@ionic/angular';

// ✅ CORRETO
import { IonButton } from '@ionic/angular/standalone';
```

### 2. Usar BehaviorSubject quando Signals funcionam
```typescript
// ❌ ERRADO (para estado simples)
private itemsSubject = new BehaviorSubject<Item[]>([]);
items$ = this.itemsSubject.asObservable();

// ✅ CORRETO
private items = signal<Item[]>([]);
readonly items$ = this.items.asReadonly();
```

### 3. Duplicar código
```typescript
// ❌ ERRADO - mesma função em 3 ficheiros
// invitation-preview.page.ts
formatDate(date: string) { ... }

// rsvp.page.ts
formatDate(date: string) { ... }

// event-detail.page.ts
formatDate(date: string) { ... }

// ✅ CORRETO - função partilhada
// src/app/utils/date.utils.ts
export function formatDatePT(date: string) { ... }
```

### 4. Hardcodar opções
```html
<!-- ❌ ERRADO - lista duplicada -->
<ion-select>
  <ion-select-option value="vegetarian">Vegetariano</ion-select-option>
  <ion-select-option value="vegan">Vegan</ion-select-option>
  ...
</ion-select>

<!-- ✅ CORRETO - usar constante -->
<ion-select>
  @for (option of DIETARY_OPTIONS; track option.value) {
    <ion-select-option [value]="option.value">
      {{ option.label }}
    </ion-select-option>
  }
</ion-select>
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm start                    # Servidor dev (localhost:4200)
vercel dev                   # Full-stack local (localhost:3000)

# Build
npm run build                # Build produção
npm run lint                 # Verificar código

# Git (SEMPRE usar development)
git add -A
git commit -m "tipo: descrição"
git push origin development
```

---

## 📋 Issues Conhecidas (MVP)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| ISSUE-001 | ✅ Componentes partilhados | Resolvido |
| ISSUE-002 | `children` vs `childrenNames` | P0 |
| ISSUE-003 | RSVP não pede idade filhos | P0 |
| ISSUE-004 | Opções alimentares duplicadas | P1 |

Ver [AUDIT-MVP-ISSUES.md](../issues/AUDIT-MVP-ISSUES.md) para lista completa.

---

## 🚀 Checklist Pre-Commit

Antes de fazer commit:

- [ ] `npm run build` passa sem erros
- [ ] Todo o texto UI está em Português
- [ ] Não há código duplicado novo
- [ ] Cores usam CSS variables
- [ ] Componentes são standalone
- [ ] Imports do Ionic vêm de `/standalone`
