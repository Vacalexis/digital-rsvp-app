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
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonItemGroup,
  IonItemDivider,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, personOutline } from 'ionicons/icons';

import { GuestService } from '@services/guest.service';
import { Guest, RsvpStatus, RSVP_STATUS_CONFIG } from '@models/index';

@Component({
  selector: 'app-guest-form',
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
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonItemGroup,
    IonItemDivider,
  ],
  templateUrl: './guest-form.page.html',
  styleUrls: ['./guest-form.page.scss'],
})
export class GuestFormPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private guestService = inject(GuestService);
  private toastController = inject(ToastController);

  isEdit = signal(false);
  eventId = signal<string>('');
  guestId = signal<string | null>(null);

  // Form fields
  name = '';
  email = '';
  phone = '';
  rsvpStatus: RsvpStatus = 'pending';
  plusOne = false;
  plusOneName = '';
  plusOneConfirmed = false;
  dietaryRestrictions = '';
  allergies = '';
  songRequest = '';
  notes = '';
  group = '';
  tableNumber: number | undefined;

  rsvpStatuses = Object.entries(RSVP_STATUS_CONFIG).map(([value, config]) => ({
    value,
    ...config,
  }));

  constructor() {
    addIcons({ saveOutline, personOutline });
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const guestId = this.route.snapshot.paramMap.get('guestId');
    
    if (eventId) {
      this.eventId.set(eventId);
    }
    
    if (guestId && guestId !== 'new') {
      this.guestId.set(guestId);
      this.isEdit.set(true);
      this.loadGuest(guestId);
    }
  }

  loadGuest(id: string) {
    const guest = this.guestService.getGuestById(id);
    if (guest) {
      this.name = guest.name;
      this.email = guest.email || '';
      this.phone = guest.phone || '';
      this.rsvpStatus = guest.rsvpStatus;
      this.plusOne = guest.plusOne;
      this.plusOneName = guest.plusOneName || '';
      this.plusOneConfirmed = guest.plusOneConfirmed || false;
      this.dietaryRestrictions = guest.dietaryRestrictions || '';
      this.allergies = guest.allergies || '';
      this.songRequest = guest.songRequest || '';
      this.notes = guest.notes || '';
      this.group = guest.group || '';
      this.tableNumber = guest.tableNumber;
    }
  }

  async save() {
    if (!this.name?.trim()) {
      const toast = await this.toastController.create({
        message: 'O nome é obrigatório.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const guestData = {
      eventId: this.eventId(),
      name: this.name.trim(),
      email: this.email?.trim() || undefined,
      phone: this.phone?.trim() || undefined,
      rsvpStatus: this.rsvpStatus,
      plusOne: this.plusOne,
      plusOneName: this.plusOneName?.trim() || undefined,
      plusOneConfirmed: this.plusOneConfirmed,
      dietaryRestrictions: this.dietaryRestrictions?.trim() || undefined,
      allergies: this.allergies?.trim() || undefined,
      songRequest: this.songRequest?.trim() || undefined,
      notes: this.notes?.trim() || undefined,
      group: this.group?.trim() || undefined,
      tableNumber: this.tableNumber,
      invitationSent: false,
      reminderSent: false,
    };

    try {
      if (this.isEdit() && this.guestId()) {
        await this.guestService.updateGuest(this.guestId()!, guestData);
      } else {
        await this.guestService.createGuest(guestData);
      }

      const toast = await this.toastController.create({
        message: this.isEdit() ? 'Convidado atualizado!' : 'Convidado adicionado!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/events', this.eventId(), 'guests']);
    } catch {
      const toast = await this.toastController.create({
        message: 'Erro ao guardar.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }
}
