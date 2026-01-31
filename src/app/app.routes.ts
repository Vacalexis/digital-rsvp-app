import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  // Login page (unprotected - only public route)
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPage),
  },
  // All other routes require authentication (including public RSVP)
  // RSVP form now protected for full staging security
  {
    path: "rsvp/:code",
    loadComponent: () =>
      import("./pages/rsvp/rsvp.page").then((m) => m.RsvpPage),
    canActivate: [authGuard],
  },
  // Public landing page (protected in staging via environment.requireAuth)
  {
    path: "",
    loadComponent: () =>
      import("./pages/landing/landing.page").then((m) => m.LandingPage),
    canActivate: [authGuard],
  },
  // Public theme gallery (protected in staging)
  {
    path: "themes",
    loadComponent: () =>
      import("./pages/themes/themes.page").then((m) => m.ThemesPage),
    canActivate: [authGuard],
  },
  // Public theme preview (protected in staging)
  {
    path: "preview/:theme",
    loadComponent: () =>
      import("./pages/preview/preview.page").then((m) => m.PreviewPage),
    canActivate: [authGuard],
  },
  // Public customization flow (protected in staging)
  {
    path: "customize",
    loadComponent: () =>
      import("./pages/customize/customize.page").then((m) => m.CustomizePage),
    canActivate: [authGuard],
  },
  // Mock payment page (protected in staging)
  {
    path: "payment",
    loadComponent: () =>
      import("./pages/payment/payment.page").then((m) => m.PaymentPage),
    canActivate: [authGuard],
  },
  {
    path: "events",
    loadComponent: () =>
      import("./pages/events/events.page").then((m) => m.EventsPage),
    canActivate: [authGuard],
  },
  {
    path: "events/new",
    loadComponent: () =>
      import("./pages/event-form/event-form.page").then((m) => m.EventFormPage),
    canActivate: [authGuard],
  },
  {
    path: "events/:id",
    loadComponent: () =>
      import("./pages/event-detail/event-detail.page").then(
        (m) => m.EventDetailPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/edit",
    loadComponent: () =>
      import("./pages/event-form/event-form.page").then((m) => m.EventFormPage),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/guests",
    loadComponent: () =>
      import("./pages/guests/guests.page").then((m) => m.GuestsPage),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/guests/new",
    loadComponent: () =>
      import("./pages/guest-form/guest-form.page").then((m) => m.GuestFormPage),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/guests/:guestId",
    loadComponent: () =>
      import("./pages/guest-form/guest-form.page").then((m) => m.GuestFormPage),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/invitation",
    loadComponent: () =>
      import("./pages/invitation-preview/invitation-preview.page").then(
        (m) => m.InvitationPreviewPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/invitations",
    loadComponent: () =>
      import("./pages/invitations/invitations.page").then(
        (m) => m.InvitationsPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: "events/:id/stats",
    loadComponent: () =>
      import("./pages/event-stats/event-stats.page").then(
        (m) => m.EventStatsPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./pages/settings/settings.page").then((m) => m.SettingsPage),
    canActivate: [authGuard],
  },
];
