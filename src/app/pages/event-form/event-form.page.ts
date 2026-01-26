import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonNote,
  IonItemGroup,
  IonItemDivider,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  calendarOutline,
  locationOutline,
  peopleOutline,
  colorPaletteOutline,
  settingsOutline,
  addOutline,
  trashOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { Event, EventType, InvitationTheme, EVENT_TYPES, INVITATION_THEMES, ScheduleItem } from '@models/index';

@Component({
  selector: 'app-event-form',
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
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonNote,
    IonItemGroup,
    IonItemDivider,
  ],
  templateUrl: './event-form.page.html',
  styleUrls: ['./event-form.page.scss'],
})
export class EventFormPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  isEdit = signal(false);
  eventId = signal<string | null>(null);

  // Form fields
  title = '';
  subtitle = '';
  description = '';
  eventType: EventType = 'wedding';
  date = new Date().toISOString();
  time = '';
  endDate = '';
  endTime = '';
  
  // Venue
  venueName = '';
  venueAddress = '';
  venueCity = '';
  venueCountry = 'Portugal';
  venueMapsUrl = '';
  
  // Settings
  hosts: string[] = [];
  theme: InvitationTheme = 'elegant';
  language = 'pt';
  rsvpDeadline = '';
  maxGuests: number | undefined;
  allowPlusOne = true;
  askDietaryRestrictions = true;
  askSongRequest = false;
  
  // Schedule
  schedule: ScheduleItem[] = [];

  eventTypes = EVENT_TYPES;
  themes = INVITATION_THEMES;

  constructor() {
    addIcons({
      saveOutline,
      calendarOutline,
      locationOutline,
      peopleOutline,
      colorPaletteOutline,
      settingsOutline,
      addOutline,
      trashOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.eventId.set(id);
      this.isEdit.set(true);
      this.loadEvent(id);
    }
  }

  loadEvent(id: string) {
    const event = this.eventService.getEventById(id);
    if (event) {
      this.title = event.title;
      this.subtitle = event.subtitle || '';
      this.description = event.description || '';
      this.eventType = event.eventType;
      this.date = event.date;
      this.time = event.time || '';
      this.endDate = event.endDate || '';
      this.endTime = event.endTime || '';
      this.venueName = event.venue.name;
      this.venueAddress = event.venue.address;
      this.venueCity = event.venue.city;
      this.venueCountry = event.venue.country;
      this.venueMapsUrl = event.venue.mapsUrl || '';
      this.hosts = [...event.hosts];
      this.theme = event.theme;
      this.language = event.language;
      this.rsvpDeadline = event.rsvpDeadline || '';
      this.maxGuests = event.maxGuests;
      this.allowPlusOne = event.allowPlusOne;
      this.askDietaryRestrictions = event.askDietaryRestrictions;
      this.askSongRequest = event.askSongRequest;
      this.schedule = event.schedule ? [...event.schedule] : [];
    }
  }

  async addHost() {
    const alert = await this.alertController.create({
      header: 'Adicionar Anfitrião',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome do anfitrião',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: (data) => {
            if (data.name?.trim()) {
              this.hosts.push(data.name.trim());
            }
          },
        },
      ],
    });
    await alert.present();
  }

  removeHost(index: number) {
    this.hosts.splice(index, 1);
  }

  async addScheduleItem() {
    const alert = await this.alertController.create({
      header: 'Adicionar ao Programa',
      inputs: [
        {
          name: 'time',
          type: 'time',
          placeholder: 'Hora',
        },
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título (ex: Cerimónia)',
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descrição (opcional)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: (data) => {
            if (data.time && data.title?.trim()) {
              this.schedule.push({
                id: `sch_${Date.now()}`,
                time: data.time,
                title: data.title.trim(),
                description: data.description?.trim() || undefined,
              });
              this.schedule.sort((a, b) => a.time.localeCompare(b.time));
            }
          },
        },
      ],
    });
    await alert.present();
  }

  removeScheduleItem(index: number) {
    this.schedule.splice(index, 1);
  }

  async save() {
    if (!this.validateForm()) {
      return;
    }

    const eventData = {
      title: this.title.trim(),
      subtitle: this.subtitle?.trim() || undefined,
      description: this.description?.trim() || undefined,
      eventType: this.eventType,
      date: this.date,
      time: this.time || undefined,
      endDate: this.endDate || undefined,
      endTime: this.endTime || undefined,
      venue: {
        name: this.venueName.trim(),
        address: this.venueAddress.trim(),
        city: this.venueCity.trim(),
        country: this.venueCountry.trim(),
        mapsUrl: this.venueMapsUrl?.trim() || undefined,
      },
      hosts: this.hosts,
      theme: this.theme,
      language: this.language,
      rsvpDeadline: this.rsvpDeadline || undefined,
      maxGuests: this.maxGuests,
      allowPlusOne: this.allowPlusOne,
      askDietaryRestrictions: this.askDietaryRestrictions,
      askSongRequest: this.askSongRequest,
      schedule: this.schedule.length > 0 ? this.schedule : undefined,
    };

    try {
      if (this.isEdit() && this.eventId()) {
        this.eventService.updateEvent(this.eventId()!, eventData);
      } else {
        this.eventService.createEvent(eventData as Omit<Event, 'id' | 'shareCode' | 'createdAt' | 'updatedAt'>);
      }

      const toast = await this.toastController.create({
        message: this.isEdit() ? 'Evento atualizado!' : 'Evento criado com sucesso!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/events']);
    } catch {
      const toast = await this.toastController.create({
        message: 'Erro ao guardar o evento.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  validateForm(): boolean {
    if (!this.title?.trim()) {
      this.showValidationError('O título é obrigatório.');
      return false;
    }
    if (!this.date) {
      this.showValidationError('A data é obrigatória.');
      return false;
    }
    if (!this.venueName?.trim()) {
      this.showValidationError('O nome do local é obrigatório.');
      return false;
    }
    if (!this.venueCity?.trim()) {
      this.showValidationError('A cidade é obrigatória.');
      return false;
    }
    return true;
  }

  async showValidationError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'warning',
    });
    await toast.present();
  }
}
