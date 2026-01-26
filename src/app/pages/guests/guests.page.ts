import { Component, inject, computed, signal, OnInit } from '@angular/core';
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
  IonChip,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
  IonNote,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  timeOutline,
  createOutline,
  trashOutline,
  mailOutline,
  callOutline,
  restaurantOutline,
  musicalNotesOutline,
  peopleOutline,
  filterOutline,
  downloadOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { GuestService } from '@services/guest.service';
import { Guest, RsvpStatus, RSVP_STATUS_CONFIG } from '@models/index';

@Component({
  selector: 'app-guests',
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
    IonChip,
    IonBadge,
    IonFab,
    IonFabButton,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonAvatar,
    IonNote,
  ],
  templateUrl: './guests.page.html',
  styleUrls: ['./guests.page.scss'],
})
export class GuestsPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);

  eventId = signal<string>('');
  searchQuery = signal('');
  statusFilter = signal<RsvpStatus | 'all'>('all');

  event = computed(() => this.eventService.getEventById(this.eventId()));
  allGuests = computed(() => this.guestService.getGuestsByEventId(this.eventId()));
  stats = computed(() => this.guestService.getGuestStats(this.eventId()));

  filteredGuests = computed(() => {
    let guests = this.allGuests();
    
    // Filter by status
    const status = this.statusFilter();
    if (status !== 'all') {
      guests = guests.filter((g) => g.rsvpStatus === status);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      guests = guests.filter((g) =>
        g.name.toLowerCase().includes(query) ||
        g.email?.toLowerCase().includes(query) ||
        g.phone?.includes(query) ||
        g.group?.toLowerCase().includes(query)
      );
    }

    return guests.sort((a, b) => a.name.localeCompare(b.name));
  });

  rsvpConfig = RSVP_STATUS_CONFIG;

  constructor() {
    addIcons({
      addOutline,
      personOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      timeOutline,
      createOutline,
      trashOutline,
      mailOutline,
      callOutline,
      restaurantOutline,
      musicalNotesOutline,
      peopleOutline,
      filterOutline,
      downloadOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
    }
  }

  segmentChanged(event: CustomEvent) {
    this.statusFilter.set(event.detail.value);
  }

  searchChanged(event: CustomEvent) {
    this.searchQuery.set(event.detail.value || '');
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join('');
  }

  getStatusConfig(status: RsvpStatus) {
    return RSVP_STATUS_CONFIG[status];
  }

  navigateToAddGuest() {
    this.router.navigate(['/events', this.eventId(), 'guests', 'new']);
  }

  navigateToEditGuest(guest: Guest) {
    this.router.navigate(['/events', this.eventId(), 'guests', guest.id]);
  }

  async updateGuestStatus(guest: Guest, newStatus: RsvpStatus) {
    await this.guestService.updateRsvpStatus(guest.id, newStatus);
    
    const toast = await this.toastController.create({
      message: `Estado atualizado para: ${RSVP_STATUS_CONFIG[newStatus].label}`,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async showStatusOptions(guest: Guest) {
    const buttons = (['confirmed', 'declined', 'maybe', 'pending'] as RsvpStatus[]).map((status) => ({
      text: RSVP_STATUS_CONFIG[status].label,
      icon: RSVP_STATUS_CONFIG[status].icon,
      handler: () => this.updateGuestStatus(guest, status),
    }));

    const actionSheet = await this.actionSheetController.create({
      header: 'Alterar Estado RSVP',
      buttons: [
        ...buttons,
        { text: 'Cancelar', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  async deleteGuest(guest: Guest) {
    const alert = await this.alertController.create({
      header: 'Eliminar Convidado',
      message: `Tem a certeza que deseja eliminar "${guest.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.guestService.deleteGuest(guest.id);
            
            const toast = await this.toastController.create({
              message: 'Convidado eliminado!',
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

  async exportGuests() {
    const csv = this.guestService.exportToCSV(this.eventId());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `convidados_${this.event()?.title || 'evento'}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);

    const toast = await this.toastController.create({
      message: 'Lista exportada com sucesso!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async addQuickGuest() {
    const alert = await this.alertController.create({
      header: 'Adicionar Convidado',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nome *' },
        { name: 'email', type: 'email', placeholder: 'Email' },
        { name: 'phone', type: 'tel', placeholder: 'Telefone' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: async (data) => {
            if (!data.name?.trim()) {
              const toast = await this.toastController.create({
                message: 'O nome é obrigatório.',
                duration: 2000,
                color: 'warning',
              });
              await toast.present();
              return false;
            }

            await this.guestService.createGuest({
              eventId: this.eventId(),
              name: data.name.trim(),
              email: data.email?.trim() || undefined,
              phone: data.phone?.trim() || undefined,
              rsvpStatus: 'pending',
              plusOne: false,
              invitationSent: false,
              reminderSent: false,
            });

            const toast = await this.toastController.create({
              message: 'Convidado adicionado!',
              duration: 2000,
              color: 'success',
            });
            await toast.present();
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
