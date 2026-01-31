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
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonModal,
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
  playCircleOutline,
  closeOutline,
  addOutline,
  trashOutline,
  timeOutline,
} from 'ionicons/icons';

import { InvitationCardComponent } from '@components/invitation-card/invitation-card.component';
import { EnvelopeOpenerComponent } from '@components/envelope-opener/envelope-opener.component';
import { Event, InvitationTheme, EventType, Venue, ScheduleItem } from '@models/index';

interface CustomizationForm {
  eventType: EventType;
  hosts: string[];
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  scheduleItems: ScheduleItem[];
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
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonModal,
    InvitationCardComponent,
    EnvelopeOpenerComponent,
  ],
  templateUrl: './customize.page.html',
  styleUrls: ['./customize.page.scss'],
})
export class CustomizePage implements OnInit {
  theme = signal<InvitationTheme>('elegant');
  showAnimationModal = signal(false);
  
  // Form data (signal para reatividade)
  form = signal<CustomizationForm>({
    eventType: 'wedding',
    hosts: ['', ''],
    title: '',
    subtitle: '',
    description: '',
    date: '',
    time: '15:00',
    endTime: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueCountry: 'Portugal',
    scheduleItems: [
      { id: '1', time: '15:00', title: 'Cerimónia', description: '', icon: 'heart' },
      { id: '2', time: '16:30', title: 'Cocktail', description: '', icon: 'wine' },
      { id: '3', time: '18:00', title: 'Jantar', description: '', icon: 'restaurant' },
      { id: '4', time: '21:00', title: 'Festa', description: '', icon: 'musical-notes' },
    ],
    allowPlusOne: true,
    askDietaryRestrictions: true,
    askSongRequest: true,
    askChildrenInfo: true,
  });

  // Getters/Setters para ngModel (bridge entre template e signal)
  get eventType() { return this.form().eventType; }
  set eventType(value: EventType) { this.form.update(f => ({ ...f, eventType: value })); }

  get hosts() { return this.form().hosts; }
  set hosts(value: string[]) { this.form.update(f => ({ ...f, hosts: value })); }

  get title() { return this.form().title; }
  set title(value: string) { this.form.update(f => ({ ...f, title: value })); }

  get subtitle() { return this.form().subtitle; }
  set subtitle(value: string) { this.form.update(f => ({ ...f, subtitle: value })); }

  get description() { return this.form().description; }
  set description(value: string) { this.form.update(f => ({ ...f, description: value })); }

  get date() { return this.form().date; }
  set date(value: string) { this.form.update(f => ({ ...f, date: value })); }

  get time() { return this.form().time; }
  set time(value: string) { this.form.update(f => ({ ...f, time: value })); }

  get endTime() { return this.form().endTime; }
  set endTime(value: string) { this.form.update(f => ({ ...f, endTime: value })); }

  get venueName() { return this.form().venueName; }
  set venueName(value: string) { this.form.update(f => ({ ...f, venueName: value })); }

  get venueAddress() { return this.form().venueAddress; }
  set venueAddress(value: string) { this.form.update(f => ({ ...f, venueAddress: value })); }

  get venueCity() { return this.form().venueCity; }
  set venueCity(value: string) { this.form.update(f => ({ ...f, venueCity: value })); }

  get venueCountry() { return this.form().venueCountry; }
  set venueCountry(value: string) { this.form.update(f => ({ ...f, venueCountry: value })); }

  get allowPlusOne() { return this.form().allowPlusOne; }
  set allowPlusOne(value: boolean) { this.form.update(f => ({ ...f, allowPlusOne: value })); }

  get askDietaryRestrictions() { return this.form().askDietaryRestrictions; }
  set askDietaryRestrictions(value: boolean) { this.form.update(f => ({ ...f, askDietaryRestrictions: value })); }

  get askSongRequest() { return this.form().askSongRequest; }
  set askSongRequest(value: boolean) { this.form.update(f => ({ ...f, askSongRequest: value })); }

  get askChildrenInfo() { return this.form().askChildrenInfo; }
  set askChildrenInfo(value: boolean) { this.form.update(f => ({ ...f, askChildrenInfo: value })); }

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
    const formData = this.form();
    const venue: Venue = {
      name: formData.venueName || 'Local do Evento',
      address: formData.venueAddress || 'Endereço',
      city: formData.venueCity || 'Cidade',
      country: formData.venueCountry || 'Portugal',
    };

    // Generate title based on event type and hosts
    let generatedTitle = formData.title;
    if (!generatedTitle && formData.eventType === 'wedding') {
      const host1 = formData.hosts[0] || 'Noivo/a';
      const host2 = formData.hosts[1] || 'Noivo/a';
      generatedTitle = `${host1} & ${host2}`;
    } else if (!generatedTitle) {
      generatedTitle = `${this.eventTypes.find(t => t.value === formData.eventType)?.label || 'Evento'}`;
    }

    return {
      id: 'preview',
      title: generatedTitle,
      subtitle: formData.subtitle || 'Celebrem connosco',
      description: formData.description || '',
      eventType: formData.eventType,
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '15:00',
      endTime: formData.endTime,
      venue,
      hosts: formData.hosts.filter(h => h.trim() !== ''),
      theme: this.theme(),
      language: 'pt',
      schedule: formData.scheduleItems.length > 0 ? formData.scheduleItems : undefined,
      allowPlusOne: formData.allowPlusOne,
      askDietaryRestrictions: formData.askDietaryRestrictions,
      askSongRequest: formData.askSongRequest,
      askChildrenInfo: formData.askChildrenInfo,
      shareCode: 'preview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Form validation
  isValid = computed(() => {
    const formData = this.form();
    const hasHost = formData.hosts.some(h => h.trim() !== '');
    const hasDate = formData.date !== '';
    const hasVenue = formData.venueName.trim() !== '';
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
      playCircleOutline,
      closeOutline,
      addOutline,
      trashOutline,
      timeOutline,
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
    const formData = this.form();
    if (formData.eventType === 'wedding') {
      if (formData.hosts[0] && formData.hosts[1]) {
        this.form.update(f => ({ ...f, title: `${formData.hosts[0]} & ${formData.hosts[1]}` }));
      } else {
        this.form.update(f => ({ ...f, title: 'O Nosso Casamento' }));
      }
      this.form.update(f => ({ ...f, subtitle: 'Celebrem connosco o nosso dia especial' }));
    } else {
      const eventLabel = this.eventTypes.find(t => t.value === formData.eventType)?.label || 'Evento';
      this.form.update(f => ({ ...f, title: eventLabel, subtitle: 'Junte-se a nós para celebrar' }));
    }
  }

  onHostChange() {
    const formData = this.form();
    if (formData.eventType === 'wedding' && formData.hosts[0] && formData.hosts[1]) {
      this.form.update(f => ({ ...f, title: `${formData.hosts[0]} & ${formData.hosts[1]}` }));
    }
  }

  proceedToPayment() {
    if (!this.isValid()) {
      return;
    }

    const formData = this.form();

    // Navigate to payment page with form data via navigation state
    this.router.navigate(['/payment'], {
      state: {
        eventData: {
          theme: this.theme(),
          eventType: formData.eventType,
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          venueName: formData.venueName,
          venueAddress: formData.venueAddress,
          venueCity: formData.venueCity,
          venueCountry: formData.venueCountry,
          hosts: formData.hosts.filter((h: string) => h.trim()),
        },
      },
    });
  }

  // Schedule management methods
  addScheduleItem() {
    this.form.update(current => ({
      ...current,
      scheduleItems: [
        ...current.scheduleItems,
        {
          id: `item-${Date.now()}`,
          time: '',
          title: '',
          description: '',
        }
      ]
    }));
  }

  removeScheduleItem(index: number) {
    this.form.update(current => ({
      ...current,
      scheduleItems: current.scheduleItems.filter((_, i) => i !== index)
    }));
  }

  updateScheduleItemTime(index: number, value: string) {
    this.form.update(current => ({
      ...current,
      scheduleItems: current.scheduleItems.map((item, i) => 
        i === index ? { ...item, time: value } : item
      )
    }));
  }

  updateScheduleItemTitle(index: number, value: string) {
    this.form.update(current => ({
      ...current,
      scheduleItems: current.scheduleItems.map((item, i) => 
        i === index ? { ...item, title: value } : item
      )
    }));
  }

  updateScheduleItemDescription(index: number, value: string) {
    this.form.update(current => ({
      ...current,
      scheduleItems: current.scheduleItems.map((item, i) => 
        i === index ? { ...item, description: value } : item
      )
    }));
  }

  openAnimationModal() {
    this.showAnimationModal.set(true);
  }

  closeAnimationModal() {
    this.showAnimationModal.set(false);
  }

  onEnvelopeOpened() {
    console.log('Envelope animation completed');
  }

  goBack() {
    this.router.navigate(['/preview', this.theme()]);
  }
}
