import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  timeOutline,
  restaurantOutline,
  personAddOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { GuestService } from '@services/guest.service';
import { RSVP_STATUS_CONFIG } from '@models/index';

@Component({
  selector: 'app-event-stats',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonChip,
  ],
  templateUrl: './event-stats.page.html',
  styleUrls: ['./event-stats.page.scss'],
})
export class EventStatsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);

  eventId = signal<string>('');
  
  event = computed(() => this.eventService.getEventById(this.eventId()));
  stats = computed(() => this.guestService.getGuestStats(this.eventId()));
  guests = computed(() => this.guestService.getGuestsByEventId(this.eventId()));
  
  guestsWithDietary = computed(() => 
    this.guests().filter(g => g.dietaryRestrictions || g.allergies)
  );
  
  guestsWithSongRequest = computed(() => 
    this.guests().filter(g => g.songRequest)
  );
  
  guestsByGroup = computed(() => this.guestService.getGuestsByGroup(this.eventId()));

  constructor() {
    addIcons({
      peopleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      timeOutline,
      restaurantOutline,
      personAddOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
    }
  }

  getConfirmationRate(): number {
    const s = this.stats();
    if (s.total === 0) return 0;
    return Math.round((s.confirmed / s.total) * 100);
  }

  getResponseRate(): number {
    const s = this.stats();
    if (s.total === 0) return 0;
    const responded = s.confirmed + s.declined + s.maybe;
    return Math.round((responded / s.total) * 100);
  }
}
