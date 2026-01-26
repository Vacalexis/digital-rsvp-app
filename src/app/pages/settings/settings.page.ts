import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonNote,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  notificationsOutline,
  colorPaletteOutline,
  languageOutline,
  informationCircleOutline,
  trashOutline,
  downloadOutline,
  shareSocialOutline,
  heartOutline,
} from 'ionicons/icons';

import { EventService } from '@services/event.service';
import { GuestService } from '@services/guest.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonToggle,
    IonNote,
  ],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  appVersion = '1.0.0';

  constructor() {
    addIcons({
      personOutline,
      notificationsOutline,
      colorPaletteOutline,
      languageOutline,
      informationCircleOutline,
      trashOutline,
      downloadOutline,
      shareSocialOutline,
      heartOutline,
    });
  }

  async exportAllData() {
    const events = this.eventService.events();
    const guests = this.guestService.guests();
    
    const data = {
      exportDate: new Date().toISOString(),
      events,
      guests,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `digital-rsvp-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);

    const toast = await this.toastController.create({
      message: 'Dados exportados com sucesso!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async clearAllData() {
    const alert = await this.alertController.create({
      header: 'Eliminar Todos os Dados',
      message: 'Tem a certeza que deseja eliminar todos os eventos e convidados? Esta ação não pode ser revertida.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar Tudo',
          role: 'destructive',
          handler: async () => {
            localStorage.removeItem('digital_rsvp_events');
            localStorage.removeItem('digital_rsvp_guests');
            
            // Reload the page to reset the app state
            window.location.reload();
          },
        },
      ],
    });
    await alert.present();
  }

  async showAbout() {
    const alert = await this.alertController.create({
      header: 'Digital RSVP',
      message: `
        <p><strong>Versão:</strong> ${this.appVersion}</p>
        <p>Aplicação para criar convites digitais elegantes e gerir RSVPs de forma simples e eficaz.</p>
        <p>Inspirado em <a href="https://thedigitalyes.com" target="_blank">The Digital Yes</a></p>
      `,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
