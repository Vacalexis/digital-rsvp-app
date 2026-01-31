import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  cardOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  calendarOutline,
  locationOutline,
  peopleOutline, heartOutline } from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { Event, EventType, InvitationTheme } from '@models/index';

interface EventData {
  eventType: EventType;
  hosts: string[];
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  allowPlusOne: boolean;
  askDietaryRestrictions: boolean;
  askSongRequest: boolean;
  askChildrenInfo: boolean;
  theme: InvitationTheme;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonButtons,
    IonBackButton,
  ],
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  eventData = signal<EventData | null>(null);
  isProcessing = signal(false);
  paymentSuccess = signal(false);
  
  // Computed for displaying hosts (filters out empty strings)
  displayHosts = computed(() => {
    const data = this.eventData();
    if (!data) return '';
    return data.hosts.filter((h) => h.trim()).join(', ');
  });
  
  eventTypeLabels: Record<EventType, string> = {
    wedding: 'Casamento',
    engagement: 'Noivado',
    birthday: 'Aniversário',
    'baby-shower': 'Chá de Bebé',
    anniversary: 'Aniversário de Casamento',
    graduation: 'Graduação',
    corporate: 'Evento Corporativo',
    other: 'Outro',
  };

  themeNames: Record<InvitationTheme, string> = {
    elegant: 'Elegante',
    minimal: 'Minimalista',
    floral: 'Floral',
    rustic: 'Rústico',
    modern: 'Moderno',
    romantic: 'Romântico',
    tropical: 'Tropical',
    classic: 'Clássico',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService
  ) {
    addIcons({checkmarkCircleOutline,calendarOutline,locationOutline,peopleOutline,heartOutline,cardOutline,lockClosedOutline,shieldCheckmarkOutline,});
  }

  ngOnInit() {
    // Get event data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    
    if (state && state['eventData']) {
      this.eventData.set(state['eventData']);
    } else {
      // Try to get from localStorage as fallback
      const storedData = localStorage.getItem('pendingEvent');
      if (storedData) {
        this.eventData.set(JSON.parse(storedData));
      } else {
        // No data, redirect back
        this.router.navigate(['/']);
      }
    }
  }

  async processPayment() {
    const data = this.eventData();
    if (!data || this.isProcessing()) return;

    this.isProcessing.set(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create the event
      const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        eventType: data.eventType,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        date: data.date,
        time: data.time,
        venue: {
          name: data.venueName,
          address: data.venueAddress,
          city: data.venueCity,
          country: data.venueCountry,
        },
        hosts: data.hosts.filter(h => h.trim() !== ''),
        theme: data.theme,
        language: 'pt',
        allowPlusOne: data.allowPlusOne,
        askDietaryRestrictions: data.askDietaryRestrictions,
        askSongRequest: data.askSongRequest,
        askChildrenInfo: data.askChildrenInfo,
        shareCode: this.generateShareCode(),
      };

      const createdEvent = await this.eventService.createEvent(event);
      
      // Clear stored data
      localStorage.removeItem('pendingEvent');
      
      // Show success
      this.paymentSuccess.set(true);
      
      // Wait a bit then redirect to event detail
      setTimeout(() => {
        this.router.navigate(['/events', createdEvent.id]);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating event:', error);
      this.isProcessing.set(false);
      // In production, show error message to user
      alert('Erro ao criar evento. Por favor, tente novamente.');
    }
  }

  generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  cancelPayment() {
    this.router.navigate(['/customize'], {
      queryParams: { theme: this.eventData()?.theme },
    });
  }
}
