import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  // Public landing page (default)
  {
    path: "",
    loadComponent: () =>
      import("./pages/landing/landing.page").then((m) => m.LandingPage),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPage),
  },
  // Public theme gallery
  {
    path: "themes",
    loadComponent: () =>
      import("./pages/themes/themes.page").then((m) => m.ThemesPage),
  },
  // Public theme preview
  {
    path: "preview/:theme",
    loadComponent: () =>
      import("./pages/preview/preview.page").then((m) => m.PreviewPage),
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
  {
    path: "rsvp/:code",
    loadComponent: () =>
      import("./pages/rsvp/rsvp.page").then((m) => m.RsvpPage),
    // No auth guard - public RSVP page
  },
];
