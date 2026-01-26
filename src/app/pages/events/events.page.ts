import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButtons,
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSegment,
  IonSegmentButton,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  peopleOutline,
  settingsOutline,
  locationOutline,
  timeOutline,
  trashOutline,
  createOutline,
  copyOutline,
  heartOutline,
  sparklesOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { GuestService } from '@services/guest.service';
import { Event, EVENT_TYPES } from '@models/index';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButtons,
    IonChip,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSegment,
    IonSegmentButton,
  ],
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage {
  private router = inject(Router);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  segment: 'upcoming' | 'past' = 'upcoming';

  events = computed(() => this.eventService.events());
  
  upcomingEvents = computed(() => this.eventService.getUpcomingEvents());
  pastEvents = computed(() => this.eventService.getPastEvents());

  displayedEvents = computed(() => 
    this.segment === 'upcoming' ? this.upcomingEvents() : this.pastEvents()
  );

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      peopleOutline,
      settingsOutline,
      locationOutline,
      timeOutline,
      trashOutline,
      createOutline,
      copyOutline,
      heartOutline,
      sparklesOutline,
    });
  }

  segmentChanged(event: CustomEvent) {
    this.segment = event.detail.value;
  }

  getEventTypeLabel(type: string): string {
    return EVENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  getEventTypeIcon(type: string): string {
    return EVENT_TYPES.find((t) => t.value === type)?.icon || 'calendar';
  }

  getGuestStats(eventId: string) {
    return this.guestService.getGuestStats(eventId);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  navigateToEvent(event: Event) {
    this.router.navigate(['/events', event.id]);
  }

  navigateToNewEvent() {
    this.router.navigate(['/events/new']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  async editEvent(event: Event, ev: MouseEvent) {
    ev.stopPropagation();
    this.router.navigate(['/events', event.id, 'edit']);
  }

  async duplicateEvent(event: Event, ev: MouseEvent) {
    ev.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Duplicar Evento',
      message: `Deseja duplicar o evento "${event.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Duplicar',
          handler: async () => {
            const newEvent = await this.eventService.duplicateEvent(event.id);
            if (newEvent) {
              const toast = await this.toastController.create({
                message: 'Evento duplicado com sucesso!',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteEvent(event: Event, ev: MouseEvent) {
    ev.stopPropagation();
    
    const stats = this.getGuestStats(event.id);
    const guestWarning = stats.total > 0 
      ? ` e ${stats.total} convidado(s) associado(s)` 
      : '';

    const alert = await this.alertController.create({
      header: 'Eliminar Evento',
      message: `Tem a certeza que deseja eliminar "${event.title}"${guestWarning}? Esta ação não pode ser revertida.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.guestService.deleteGuestsByEventId(event.id);
            await this.eventService.deleteEvent(event.id);
            
            const toast = await this.toastController.create({
              message: 'Evento eliminado com sucesso!',
              duration: 2000,
              color: 'success',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }
}
