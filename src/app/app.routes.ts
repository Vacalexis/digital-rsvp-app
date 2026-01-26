import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.page').then((m) => m.EventsPage),
  },
  {
    path: 'events/new',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./pages/event-detail/event-detail.page').then((m) => m.EventDetailPage),
  },
  {
    path: 'events/:id/edit',
    loadComponent: () => import('./pages/event-form/event-form.page').then((m) => m.EventFormPage),
  },
  {
    path: 'events/:id/guests',
    loadComponent: () => import('./pages/guests/guests.page').then((m) => m.GuestsPage),
  },
  {
    path: 'events/:id/guests/new',
    loadComponent: () => import('./pages/guest-form/guest-form.page').then((m) => m.GuestFormPage),
  },
  {
    path: 'events/:id/guests/:guestId',
    loadComponent: () => import('./pages/guest-form/guest-form.page').then((m) => m.GuestFormPage),
  },
  {
    path: 'events/:id/invitation',
    loadComponent: () => import('./pages/invitation-preview/invitation-preview.page').then((m) => m.InvitationPreviewPage),
  },
  {
    path: 'events/:id/stats',
    loadComponent: () => import('./pages/event-stats/event-stats.page').then((m) => m.EventStatsPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'rsvp/:code',
    loadComponent: () => import('./pages/rsvp/rsvp.page').then((m) => m.RsvpPage),
  },
];
