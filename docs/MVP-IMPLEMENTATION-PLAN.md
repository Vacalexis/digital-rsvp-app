# 🚀 MVP Implementation Plan - Digital RSVP App

> **Business Vision**: INSTANT digital wedding invitations - Preview, Customize, Purchase, Manage
> **Target Launch**: Q1 2026
> **Last Updated**: 31 Janeiro 2026

---

## 📊 Executive Summary

### The Problem We Solve
Current wedding invitation suppliers take **days to weeks** to deliver even digital designs. We make it **INSTANT** - customers preview, customize, and purchase in minutes.

### Value Proposition
1. **Instant Delivery** - No waiting for designers
2. **Full Preview Before Purchase** - See exactly what you get (individual, couple, family variants)
3. **Self-Service Customization** - Within our quality standards
4. **Integrated RSVP Management** - BackOffice included with purchase
5. **100% Digital Business** - No physical inventory, global reach

### Customer Journey
```
DISCOVERY → PREVIEW → CUSTOMIZE → PURCHASE → MANAGE GUESTS → COLLECT RSVPs
   ↓           ↓          ↓           ↓            ↓              ↓
 Ads/SEO   See themes   Names,     Stripe    Upload list,   Share links,
           & variants   dates...   payment   set options    track stats
```

---

## 🔍 Current State Analysis

### ✅ What's Built (Working)

| Feature | Status | Notes |
|---------|--------|-------|
| Event CRUD | ✅ Complete | Create, edit, delete events via MongoDB |
| 7 Invitation Themes | ✅ Complete | elegant, minimal, floral, rustic, modern, romantic, tropical, classic |
| Invitation Types | ✅ Complete | single, couple, family, group |
| Guest Management | ✅ Complete | Add, edit, delete, dietary restrictions |
| RSVP Public Form | ✅ Complete | Guests can respond via unique link |
| Invitation Preview | ✅ Complete | Admin can preview invitation variants |
| Envelope Animation | ✅ Complete | Interactive open on hover |
| Basic Auth | ✅ Complete | Session-based, rate limiting |
| Vercel API | ✅ Complete | All CRUD endpoints working |
| MongoDB Integration | ✅ Complete | Atlas cloud database |

### 🔄 Partially Built (Needs Fixes)

| Feature | Issue | Priority |
|---------|-------|----------|
| Children data model | `children` vs `childrenNames` inconsistency | P0 |
| RSVP children ages | Not asking if host didn't fill | P0 |
| Dietary options | Duplicated in multiple files | P1 |

### ❌ Missing for MVP

| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **Public Landing Page** | Marketing page with preview gallery | P0 | 8h |
| **Theme Gallery** | Browse all themes with live preview | P0 | 6h |
| **Customization Flow** | Edit names, date, venue before purchase | P0 | 12h |
| **Payment Integration** | Stripe Checkout for purchases | P0 | 8h |
| **User Accounts** | Firebase/Auth0 - multi-user support | P0 | 12h |
| **Purchase → BackOffice** | After payment, user gets access to manage | P0 | 6h |
| **Share Link Generator** | Copy link, WhatsApp, email buttons | P1 | 4h |
| **Email Templates** | Send RSVP links via email | P2 | 8h |
| **QR Code Generator** | For printed materials | P2 | 2h |

---

## 🎯 MVP Scope Definition

### Phase 1: Fix Current Issues (Sprint 1 - 1 week)
> **Goal**: Stabilize existing code before adding features

1. **ISSUE-002**: Unify `children` data model
2. **ISSUE-003**: RSVP asks children ages when missing
3. **ISSUE-004**: Extract dietary options to constant
4. Clean up console.logs and debug code

### Phase 2: Public Preview Experience (Sprint 2 - 2 weeks)
> **Goal**: Visitors can preview invitations before signup

1. **Landing Page** (`/`)
   - Hero section with value proposition
   - Theme gallery carousel
   - "Começar Agora" CTA → Theme Selection

2. **Theme Gallery** (`/themes`)
   - Grid of all 8 themes
   - Click to see live preview
   - Filter by style (romantic, modern, rustic...)

3. **Live Preview** (`/preview/:theme`)
   - Interactive invitation card
   - Toggle between Single / Couple / Family views
   - Sample data (editable in customization)
   - "Personalizar" button → Customization

### Phase 3: Customization & Purchase (Sprint 3 - 2 weeks)
> **Goal**: Convert visitors to paying customers

1. **Customization Flow** (`/customize/:theme`)
   - Step 1: Event Details (names, date, venue)
   - Step 2: Options (dietary, +1, children, songs)
   - Step 3: Preview Final Result
   - Step 4: Checkout

2. **Stripe Integration**
   - Product: "Convite Digital - Tema X"
   - One-time payment (not subscription)
   - Success → Create user account + event

3. **User Registration**
   - Email/password or Google OAuth
   - Created automatically after purchase
   - Welcome email with BackOffice access

### Phase 4: BackOffice Polish (Sprint 4 - 1 week)
> **Goal**: Great post-purchase experience

1. **Onboarding Flow**
   - First login tutorial
   - "Add your first guests" prompt
   - Share link prominently displayed

2. **Share Tools**
   - Copy Link button
   - WhatsApp share button
   - Email share (opens mail client)
   - QR code (basic)

3. **RSVP Dashboard**
   - Real-time stats (already built, enhance)
   - Export to CSV/Excel

---

## 🏗️ Technical Architecture

### New Routes Needed

```typescript
// Public routes (no auth)
{ path: '', component: LandingPage },
{ path: 'themes', component: ThemeGalleryPage },
{ path: 'preview/:theme', component: PublicPreviewPage },
{ path: 'customize/:theme', component: CustomizePage },
{ path: 'checkout/success', component: CheckoutSuccessPage },
{ path: 'checkout/cancel', component: CheckoutCancelPage },

// Protected routes (existing, behind auth)
{ path: 'dashboard', ... },  // Rename from 'events'
{ path: 'dashboard/:eventId', ... },
```

### New Services Needed

```
src/app/services/
├── auth.service.ts         # Enhance: Firebase/Auth0
├── payment.service.ts      # NEW: Stripe integration
├── user.service.ts         # NEW: User profile management
├── analytics.service.ts    # NEW: Track conversions
└── share.service.ts        # NEW: Share link utilities
```

### New API Endpoints

```
api/
├── auth/
│   ├── register.ts         # Create user after purchase
│   ├── login.ts            # Email/password login
│   └── me.ts               # Get current user
├── payments/
│   ├── create-session.ts   # Stripe checkout session
│   └── webhook.ts          # Stripe webhook handler
└── users/
    ├── [id].ts             # User CRUD
    └── index.ts            # List users (admin)
```

### Environment Variables Needed

```
# Existing
MONGODB_URI=...

# New
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Auth (if Firebase)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

---

## 💰 Pricing Strategy (Recommendation)

### Option A: Simple One-Time
| Product | Price | Includes |
|---------|-------|----------|
| Convite Digital | €29 | 1 event, unlimited guests, 1 year access |

### Option B: Tiered
| Tier | Price | Guests | Features |
|------|-------|--------|----------|
| Básico | €19 | Up to 50 | Basic RSVP |
| Standard | €39 | Up to 150 | + Dietary, +1, Stats |
| Premium | €59 | Unlimited | + Custom questions, Priority support |

### Recommendation for MVP
Start with **Option A at €29** - simple, clear value proposition. Add tiers later based on customer feedback.

---

## 📅 Sprint Planning

### Sprint 1: Stabilization (Week 1)
- [ ] Fix ISSUE-002: children data model
- [ ] Fix ISSUE-003: RSVP children ages
- [ ] Fix ISSUE-004: dietary constants
- [ ] Remove console.logs from production
- [ ] Test all existing flows end-to-end
- **Deliverable**: Stable current features

### Sprint 2: Public Experience (Weeks 2-3)
- [ ] Create LandingPage component
- [ ] Create ThemeGalleryPage component
- [ ] Create PublicPreviewPage component
- [ ] Add public routes (no auth required)
- [ ] Polish invitation-card responsive design
- [ ] Add theme metadata (descriptions, tags)
- **Deliverable**: Public can browse and preview

### Sprint 3: Payment Flow (Weeks 4-5)
- [ ] Create CustomizePage with wizard steps
- [ ] Integrate Stripe Checkout
- [ ] Create payment API endpoints
- [ ] Create user registration flow
- [ ] Create CheckoutSuccessPage
- [ ] Wire up: payment → create event → redirect to dashboard
- **Deliverable**: End-to-end purchase flow

### Sprint 4: Polish & Launch (Week 6)
- [ ] Onboarding tutorial for new users
- [ ] Share tools (copy, WhatsApp, email)
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] SEO meta tags
- [ ] Test on real devices
- **Deliverable**: MVP ready for soft launch

---

## 🎨 Design Priorities

### Landing Page Structure
```
[HERO]
  Headline: "Convites Digitais Instantâneos"
  Subhead: "Personalize, visualize e envie em minutos"
  CTA: "Ver Temas" →
  
[FEATURES]
  ✓ Entrega instantânea
  ✓ RSVP integrado
  ✓ Gestão de convidados
  ✓ Estatísticas em tempo real

[THEME GALLERY]
  8 theme cards with preview

[HOW IT WORKS]
  1. Escolhe o tema
  2. Personaliza os detalhes
  3. Envia aos convidados
  4. Acompanha as confirmações

[TESTIMONIALS] (can be placeholder initially)

[PRICING]
  Simple one-time price card

[FOOTER]
  Links, contact, legal
```

### Mobile-First
All new pages must work perfectly on mobile:
- 375px minimum width
- Touch-friendly buttons (44px minimum)
- Swipe gestures for gallery
- Fast loading (< 3s on 3G)

---

## 📈 Success Metrics

### MVP Launch Goals
| Metric | Target | Measurement |
|--------|--------|-------------|
| Landing → Preview | 60%+ | Analytics |
| Preview → Customize | 30%+ | Analytics |
| Customize → Purchase | 10%+ | Stripe |
| RSVP Response Rate | 70%+ | App data |
| Customer Satisfaction | 4.5/5 | Survey |

### Technical KPIs
| Metric | Target |
|--------|--------|
| Page Load Time | < 2s |
| Time to Interactive | < 3s |
| Error Rate | < 1% |
| Uptime | 99.5%+ |

---

## 🚧 Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stripe integration delays | High | Start early, use test mode |
| Theme styling inconsistencies | Medium | Create design system tokens |
| Payment fraud | Medium | Use Stripe Radar |
| User auth complexity | Medium | Use managed service (Firebase) |
| SEO takes time | Medium | Prepare content early |

---

## 📁 Files to Create

### New Pages
```
src/app/pages/
├── landing/
│   ├── landing.page.ts
│   ├── landing.page.html
│   └── landing.page.scss
├── theme-gallery/
│   ├── theme-gallery.page.ts
│   ├── theme-gallery.page.html
│   └── theme-gallery.page.scss
├── public-preview/
│   ├── public-preview.page.ts
│   ├── public-preview.page.html
│   └── public-preview.page.scss
├── customize/
│   ├── customize.page.ts
│   ├── customize.page.html
│   └── customize.page.scss
├── checkout-success/
│   └── checkout-success.page.ts
└── checkout-cancel/
    └── checkout-cancel.page.ts
```

### New Services
```
src/app/services/
├── payment.service.ts
├── user.service.ts
└── share.service.ts
```

### New API
```
api/
├── payments/
│   ├── create-session.ts
│   └── webhook.ts
└── auth/
    ├── register.ts
    └── login.ts
```

---

## ✅ Pre-Launch Checklist

- [ ] All RSVP flows tested (single, couple, family)
- [ ] Payment flow tested with real card (test mode)
- [ ] Email flows tested (if implemented)
- [ ] Mobile tested on iOS and Android
- [ ] Tablet tested
- [ ] Desktop tested (Chrome, Firefox, Safari)
- [ ] Error pages exist (404, 500)
- [ ] Privacy Policy page exists
- [ ] Terms of Service page exists
- [ ] Cookie consent (if required by region)
- [ ] GDPR compliance (data deletion)
- [ ] Analytics tracking working
- [ ] Stripe webhook verified
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Backup strategy defined

---

## 🎬 Next Immediate Actions

1. **Today**: Fix P0 issues (children model, RSVP ages)
2. **This Week**: Complete Sprint 1 stabilization
3. **Next Week**: Start Landing Page and Theme Gallery
4. **Week 3**: Stripe integration research & setup
5. **Week 4-5**: Full payment flow implementation
6. **Week 6**: Polish and soft launch

---

*This plan should be reviewed weekly and adjusted based on progress and learnings.*
