import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonToggle,
  IonItem,
  IonLabel,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  calendarOutline,
  locationOutline,
  timeOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { GuestService } from '@services/guest.service';
import { Event, RsvpStatus, INVITATION_THEMES } from '@models/index';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
    IonToggle,
    IonItem,
    IonLabel,
  ],
  templateUrl: './rsvp.page.html',
  styleUrls: ['./rsvp.page.scss'],
})
export class RsvpPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private toastController = inject(ToastController);

  shareCode = signal<string>('');
  event = signal<Event | undefined>(undefined);
  submitted = signal(false);
  response = signal<RsvpStatus | null>(null);

  // Form
  guestName = '';
  guestEmail = '';
  guestPhone = '';
  attending: 'yes' | 'no' | 'maybe' = 'yes';
  bringingPlusOne = false;
  plusOneName = '';
  dietaryRestrictions = '';
  songRequest = '';
  message = '';

  constructor() {
    addIcons({
      heartOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      calendarOutline,
      locationOutline,
      timeOutline,
    });
  }

  async ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.shareCode.set(code);
      // Try local state first, then fetch from API
      let foundEvent = this.eventService.getEventByShareCode(code);
      if (!foundEvent) {
        foundEvent = await this.eventService.getEventByShareCodeAsync(code);
      }
      this.event.set(foundEvent);
    }
  }

  getThemeColor(): string {
    const evt = this.event();
    if (!evt) return '#8b5a5a';
    return INVITATION_THEMES.find((t) => t.value === evt.theme)?.color || '#8b5a5a';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      // Handle ISO date strings from IonDatetime (e.g., "2026-03-14T00:00:00")
      const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = datePart.split('-').map(Number);
      
      if (!year || !month || !day) {
        return dateStr;
      }
      
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  async submit() {
    const evt = this.event();
    if (!evt || !this.guestName?.trim()) {
      const toast = await this.toastController.create({
        message: 'Por favor, preencha o seu nome.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const rsvpStatus: RsvpStatus = 
      this.attending === 'yes' ? 'confirmed' : 
      this.attending === 'no' ? 'declined' : 'maybe';

    await this.guestService.createGuest({
      eventId: evt.id,
      name: this.guestName.trim(),
      email: this.guestEmail?.trim() || undefined,
      phone: this.guestPhone?.trim() || undefined,
      rsvpStatus,
      rsvpDate: new Date().toISOString(),
      plusOne: this.bringingPlusOne,
      plusOneName: this.plusOneName?.trim() || undefined,
      plusOneConfirmed: this.bringingPlusOne,
      dietaryRestrictions: this.dietaryRestrictions?.trim() || undefined,
      songRequest: this.songRequest?.trim() || undefined,
      notes: this.message?.trim() || undefined,
      invitationSent: true,
      reminderSent: false,
    });

    this.response.set(rsvpStatus);
    this.submitted.set(true);
  }
}
