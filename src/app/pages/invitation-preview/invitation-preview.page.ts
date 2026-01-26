import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shareOutline,
  calendarOutline,
  locationOutline,
  timeOutline,
  heartOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { INVITATION_THEMES } from '@models/index';

@Component({
  selector: 'app-invitation-preview',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
  ],
  templateUrl: './invitation-preview.page.html',
  styleUrls: ['./invitation-preview.page.scss'],
})
export class InvitationPreviewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  eventId = signal<string>('');
  event = computed(() => this.eventService.getEventById(this.eventId()));

  constructor() {
    addIcons({
      shareOutline,
      calendarOutline,
      locationOutline,
      timeOutline,
      heartOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
    }
  }

  getThemeColor(): string {
    const event = this.event();
    if (!event) return '#8b5a5a';
    return INVITATION_THEMES.find((t) => t.value === event.theme)?.color || '#8b5a5a';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getDaysUntil(): number {
    const event = this.event();
    if (!event) return 0;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  shareInvitation() {
    const event = this.event();
    if (!event) return;

    const url = `${window.location.origin}/rsvp/${event.shareCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Você está convidado para ${event.title}!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  }
}
