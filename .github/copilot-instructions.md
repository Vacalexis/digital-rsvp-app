# Copilot Custom Instructions - Digital RSVP App

## 📋 Project Overview

This is an **Ionic 8 + Angular 18** standalone application for digital invitations and RSVP management. The app allows users to create digital event invitations, manage guest lists, track RSVPs, and export guest data.

### Core Purpose
- **Event Management**: Create and manage events with customizable invitations
- **Guest Lists**: Import/export guests, track dietary restrictions, plus-ones
- **RSVP Tracking**: Real-time confirmation status with statistics
- **Digital Invitations**: Beautiful themed invitations shareable via link/QR code

---

## 🏗️ Project Architecture

### Tech Stack
- **Framework**: Ionic 8 with Angular 18
- **Components**: Standalone components (no NgModules)
- **State Management**: Angular Signals
- **Styling**: SCSS with CSS custom properties
- **Storage**: LocalStorage (can be extended to backend API)
- **Language**: TypeScript with strict mode

### Folder Structure
```
src/
├── app/
│   ├── models/                    # TypeScript interfaces
│   │   ├── index.ts
│   │   ├── event.model.ts
│   │   └── guest.model.ts
│   ├── services/                  # Business logic services
│   │   ├── index.ts
│   │   ├── event.service.ts
│   │   └── guest.service.ts
│   ├── pages/                     # Page components
│   │   ├── events/                # Events list
│   │   ├── event-detail/          # Event dashboard
│   │   ├── event-form/            # Create/edit event
│   │   ├── event-stats/           # RSVP statistics
│   │   ├── guests/                # Guest list management
│   │   ├── guest-form/            # Add/edit guest
│   │   ├── invitation-preview/    # Digital invitation view
│   │   ├── rsvp/                  # Public RSVP form
│   │   └── settings/              # App settings
│   ├── app.component.ts
│   └── app.routes.ts
├── theme/
│   └── variables.scss             # Ionic theme variables
├── global.scss                    # Global styles
├── index.html
└── main.ts                        # Bootstrap file
```

---

## 🎨 Design System

| Color | CSS Variable | Hex | Usage |
|-------|--------------|-----|-------|
| Rose/Burgundy | `--ion-color-primary` | `#8b5a5a` | Primary, buttons, headers |
| Soft Gold | `--ion-color-secondary` | `#c9a962` | Accents, highlights |
| Sage Green | `--ion-color-tertiary` | `#7d9a7d` | Tertiary elements |
| Success Green | `--ion-color-success` | `#5a8b5a` | Confirmed RSVPs |
| Warning Gold | `--ion-color-warning` | `#d4a84b` | Pending status |
| Danger Red | `--ion-color-danger` | `#c25050` | Declined, errors |
| Cream White | `--ion-color-light` | `#faf5f0` | Background |
| Dark Gray | `--ion-color-dark` | `#2d2d2d` | Text |

### Typography
- **Font Family**: System fonts (can be customized with Google Fonts)
- **UI Language**: Portuguese (PT-PT)

### Component Patterns
- Elegant, wedding-themed design
- Cards for content grouping
- Segment controls for filtering
- FAB buttons for primary actions
- Status badges with colors matching RSVP status

---

## 📝 Coding Conventions

### Angular/TypeScript
```typescript
// ✅ DO: Use standalone components
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, IonButton, ...],
})

// ✅ DO: Use Angular Signals for state
events = signal<Event[]>([]);
upcomingEvents = computed(() => this.filterUpcoming(this.events()));

// ✅ DO: Use explicit return types
getEventById(id: string): Event | undefined { }

// ❌ DON'T: Use NgModules
// ❌ DON'T: Use BehaviorSubject when Signals work
```

### Ionic Components
```typescript
// ✅ DO: Import Ionic components individually from standalone
import { IonButton, IonContent, IonHeader } from '@ionic/angular/standalone';

// ✅ DO: Use mode="ios" for consistent styling
// Set globally in main.ts: provideIonicAngular({ mode: 'ios' })

// ❌ DON'T: Import from '@ionic/angular' (use standalone imports)
```

### SCSS Styling
```scss
// ✅ DO: Use Ionic CSS custom properties
ion-toolbar {
  --background: var(--ion-color-primary);
  --color: white;
}

// ✅ DO: Use :host for component-scoped styles
:host {
  --ion-background-color: var(--ion-color-light);
}

// ❌ DON'T: Use !important unless absolutely necessary
// ❌ DON'T: Hardcode colors - use CSS variables
```

### File Naming
- Pages: `*.page.ts`, `*.page.html`, `*.page.scss`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Use kebab-case for file names

---

## 🔧 Key Models

### Event
```typescript
interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  eventType: EventType;        // 'wedding' | 'birthday' | 'corporate' | etc.
  date: string;                // ISO date string
  time?: string;
  venue: Venue;
  hosts: string[];
  theme: InvitationTheme;      // 'elegant' | 'minimal' | 'floral' | etc.
  allowPlusOne: boolean;
  askDietaryRestrictions: boolean;
  askSongRequest: boolean;
  shareCode: string;           // Unique code for RSVP link
  createdAt: string;
  updatedAt: string;
}
```

### Guest
```typescript
interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RsvpStatus;      // 'pending' | 'confirmed' | 'declined' | 'maybe'
  plusOne: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  songRequest?: string;
  tableNumber?: number;
  group?: string;
  invitationSent: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### GuestStats
```typescript
interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  totalAttending: number;      // Includes plus-ones
  dietaryRestrictions: number;
}
```

---

## 🚀 Common Tasks

### Adding a New Page
1. Create folder in `src/app/pages/`
2. Create `*.page.ts`, `*.page.html`, `*.page.scss`
3. Add route in `app.routes.ts` with lazy loading
4. Use standalone component pattern

### Adding a New Service
1. Create in `src/app/services/`
2. Export from `src/app/services/index.ts`
3. Use `providedIn: 'root'` for singleton

### Extending Data Model
1. Update interfaces in `src/app/models/`
2. Update barrel export in `src/app/models/index.ts`
3. Update service methods as needed
4. Update LocalStorage migration if schema changes

---

## ⚠️ Important Notes

1. **LocalStorage**: Data persists in browser. For production, implement backend API.
2. **Share Links**: Use `shareCode` in URL for public RSVP access.
3. **RSVP Flow**: Public route `/rsvp/:code` allows guests to respond without login.
4. **Portuguese UI**: All user-facing text must be in Portuguese.
5. **Mobile-First**: Design for mobile devices first, then enhance for tablets/desktop.

---

## 🧪 Commands

```bash
npm start          # Development server (http://localhost:4200)
npm run build      # Production build
npm run lint       # Lint check
```

---

## 🚀 Deployment (Vercel)

This project is configured for **Vercel** deployment with automatic deploys on push.

### Configuration
- **Config file**: `vercel.json` (in project root)
- **Build command**: `npm run build`
- **Output directory**: `www`
- **SPA rewrites**: Configured for Angular routing

### Setup Steps
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" → Import your repository
4. Vercel auto-detects settings from `vercel.json`
5. Click Deploy - done!

### Features (Free Tier)
- ✅ Unlimited projects
- ✅ Custom domains (free)
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deploy on push to main branch
- ✅ Preview deployments for PRs
- ✅ 100GB bandwidth/month

### Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your domain (e.g., `rsvp.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic

---

## 🔮 Future Enhancements

- [ ] Backend API integration (Firebase/Supabase)
- [ ] QR code generation for invitations
- [ ] Email/SMS notification sending
- [ ] Image upload for event covers
- [ ] User authentication
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] PDF export of guest lists
- [ ] Table/seating chart management
- [ ] Wedding website builder integration
