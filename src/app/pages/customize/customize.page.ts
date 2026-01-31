import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonItem,
  IonLabel,
  IonList,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  locationOutline,
  peopleOutline,
  settingsOutline,
  eyeOutline,
  arrowForwardOutline,
  heartOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { InvitationCardComponent } from '@components/invitation-card/invitation-card.component';
import { Event, InvitationTheme, EventType, Venue } from '@models/index';

interface CustomizationForm {
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
}

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonItem,
    IonLabel,
    IonList,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    InvitationCardComponent,
  ],
  templateUrl: './customize.page.html',
  styleUrls: ['./customize.page.scss'],
})
export class CustomizePage implements OnInit {
  theme = signal<InvitationTheme>('elegant');
  
  // Form data
  form: CustomizationForm = {
    eventType: 'wedding',
    hosts: ['', ''],
    title: '',
    subtitle: '',
    description: '',
    date: '',
    time: '15:00',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueCountry: 'Portugal',
    allowPlusOne: true,
    askDietaryRestrictions: true,
    askSongRequest: true,
    askChildrenInfo: true,
  };

  // Event types
  eventTypes = [
    { value: 'wedding' as EventType, label: 'Casamento' },
    { value: 'engagement' as EventType, label: 'Noivado' },
    { value: 'birthday' as EventType, label: 'Aniversário' },
    { value: 'baby-shower' as EventType, label: 'Chá de Bebé' },
    { value: 'anniversary' as EventType, label: 'Aniversário de Casamento' },
    { value: 'graduation' as EventType, label: 'Graduação' },
    { value: 'corporate' as EventType, label: 'Evento Corporativo' },
    { value: 'other' as EventType, label: 'Outro' },
  ];

  // Theme names
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

  // Preview event (computed from form)
  previewEvent = computed<Event>(() => {
    const venue: Venue = {
      name: this.form.venueName || 'Local do Evento',
      address: this.form.venueAddress || 'Endereço',
      city: this.form.venueCity || 'Cidade',
      country: this.form.venueCountry || 'Portugal',
    };

    // Generate title based on event type and hosts
    let generatedTitle = this.form.title;
    if (!generatedTitle && this.form.eventType === 'wedding') {
      const host1 = this.form.hosts[0] || 'Noivo/a';
      const host2 = this.form.hosts[1] || 'Noivo/a';
      generatedTitle = `${host1} & ${host2}`;
    } else if (!generatedTitle) {
      generatedTitle = `${this.eventTypes.find(t => t.value === this.form.eventType)?.label || 'Evento'}`;
    }

    return {
      id: 'preview',
      title: generatedTitle,
      subtitle: this.form.subtitle || 'Celebrem connosco',
      description: this.form.description || '',
      eventType: this.form.eventType,
      date: this.form.date || new Date().toISOString().split('T')[0],
      time: this.form.time || '15:00',
      venue,
      hosts: this.form.hosts.filter(h => h.trim() !== ''),
      theme: this.theme(),
      language: 'pt',
      allowPlusOne: this.form.allowPlusOne,
      askDietaryRestrictions: this.form.askDietaryRestrictions,
      askSongRequest: this.form.askSongRequest,
      askChildrenInfo: this.form.askChildrenInfo,
      shareCode: 'preview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Form validation
  isValid = computed(() => {
    const hasHost = this.form.hosts.some(h => h.trim() !== '');
    const hasDate = this.form.date !== '';
    const hasVenue = this.form.venueName.trim() !== '';
    return hasHost && hasDate && hasVenue;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      calendarOutline,
      locationOutline,
      peopleOutline,
      settingsOutline,
      eyeOutline,
      arrowForwardOutline,
      heartOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit() {
    // Get theme from URL parameter
    const themeParam = this.route.snapshot.queryParamMap.get('theme');
    if (themeParam && this.isValidTheme(themeParam)) {
      this.theme.set(themeParam as InvitationTheme);
    }

    // Set default title based on event type
    this.updateDefaultTitle();
  }

  isValidTheme(theme: string): boolean {
    const validThemes: InvitationTheme[] = [
      'elegant',
      'minimal',
      'floral',
      'rustic',
      'modern',
      'romantic',
      'tropical',
      'classic',
    ];
    return validThemes.includes(theme as InvitationTheme);
  }

  onEventTypeChange() {
    this.updateDefaultTitle();
  }

  updateDefaultTitle() {
    // Auto-generate title based on event type
    if (this.form.eventType === 'wedding') {
      if (this.form.hosts[0] && this.form.hosts[1]) {
        this.form.title = `${this.form.hosts[0]} & ${this.form.hosts[1]}`;
      } else {
        this.form.title = 'O Nosso Casamento';
      }
      this.form.subtitle = 'Celebrem connosco o nosso dia especial';
    } else {
      const eventLabel = this.eventTypes.find(t => t.value === this.form.eventType)?.label || 'Evento';
      this.form.title = eventLabel;
      this.form.subtitle = 'Junte-se a nós para celebrar';
    }
  }

  onHostChange() {
    if (this.form.eventType === 'wedding' && this.form.hosts[0] && this.form.hosts[1]) {
      this.form.title = `${this.form.hosts[0]} & ${this.form.hosts[1]}`;
    }
  }

  proceedToPayment() {
    if (!this.isValid()) {
      return;
    }

    // Navigate to payment page with form data via navigation state
    this.router.navigate(['/payment'], {
      state: {
        eventData: {
          theme: this.theme(),
          eventType: this.form.eventType,
          title: this.form.title,
          subtitle: this.form.subtitle,
          description: this.form.description,
          date: this.form.date,
          time: this.form.time,
          venueName: this.form.venueName,
          venueAddress: this.form.venueAddress,
          venueCity: this.form.venueCity,
          venueCountry: this.form.venueCountry,
          hosts: this.form.hosts.filter((h: string) => h.trim()),
        },
      },
    });
  }

  goBack() {
    this.router.navigate(['/preview', this.theme()]);
  }
}
