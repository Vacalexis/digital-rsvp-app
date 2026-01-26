import { Component, inject, computed, signal, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonSpinner,
  AlertController,
  ToastController,
  ActionSheetController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  calendarOutline,
  locationOutline,
  timeOutline,
  peopleOutline,
  shareOutline,
  qrCodeOutline,
  createOutline,
  statsChartOutline,
  mailOutline,
  copyOutline,
  linkOutline,
  navigateOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  ellipsisHorizontalOutline,
  documentTextOutline,
  eyeOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import { GuestService } from "@services/guest.service";
import { Event, EVENT_TYPES, GuestStats } from "@models/index";

@Component({
  selector: "app-event-detail",
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonSpinner,
  ],
  templateUrl: "./event-detail.page.html",
  styleUrls: ["./event-detail.page.scss"],
})
export class EventDetailPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);

  eventId = signal<string>("");
  loading = signal<boolean>(false);

  event = signal<Event | null>(null);
  guestStats = computed(() => this.guestService.getGuestStats(this.eventId()));
  guests = computed(() => this.guestService.getGuestsByEventId(this.eventId()));

  constructor() {
    addIcons({
      calendarOutline,
      locationOutline,
      timeOutline,
      peopleOutline,
      shareOutline,
      qrCodeOutline,
      createOutline,
      statsChartOutline,
      mailOutline,
      copyOutline,
      linkOutline,
      navigateOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      ellipsisHorizontalOutline,
      documentTextOutline,
      eyeOutline,
    });

    // Removed effect - now handled in loadEventData
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.eventId.set(id);
      // Load event asynchronously outside the reactive context
      this.loadEventData(id);
    }
  }

  private async loadEventData(id: string) {
    this.loading.set(true);
    try {
      await this.eventService.ensureEventLoaded(id);
      const loadedEvent = this.eventService.getEventById(id);
      this.event.set(loadedEvent ?? null);
    } finally {
      this.loading.set(false);
    }
  }

  getEventTypeLabel(type: string): string {
    return EVENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  getDaysUntilEvent(): number {
    const event = this.event();
    if (!event) return 0;

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getConfirmationRate(): number {
    const stats = this.guestStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.confirmed / stats.total) * 100);
  }

  navigateToGuests() {
    this.router.navigate(["/events", this.eventId(), "guests"]);
  }

  navigateToStats() {
    this.router.navigate(["/events", this.eventId(), "stats"]);
  }

  navigateToEdit() {
    this.router.navigate(["/events", this.eventId(), "edit"]);
  }

  navigateToInvitation() {
    this.router.navigate(["/events", this.eventId(), "invitation"]);
  }

  navigateToInvitations() {
    this.router.navigate(["/events", this.eventId(), "invitations"]);
  }

  async showShareOptions() {
    const event = this.event();
    if (!event) return;

    const actionSheet = await this.actionSheetController.create({
      header: "Partilhar Convite",
      buttons: [
        {
          text: "Copiar Link",
          icon: "link-outline",
          handler: () => {
            this.copyShareLink();
          },
        },
        {
          text: "Ver QR Code",
          icon: "qr-code-outline",
          handler: () => {
            this.showQRCode();
          },
        },
        {
          text: "Pré-visualizar Convite",
          icon: "eye-outline",
          handler: () => {
            this.navigateToInvitation();
          },
        },
        {
          text: "Cancelar",
          role: "cancel",
        },
      ],
    });

    await actionSheet.present();
  }

  async copyShareLink() {
    const event = this.event();
    if (!event) return;

    const link = `${window.location.origin}/rsvp/${event.shareCode}`;

    try {
      await navigator.clipboard.writeText(link);
      const toast = await this.toastController.create({
        message: "Link copiado para a área de transferência!",
        duration: 2000,
        color: "success",
      });
      await toast.present();
    } catch {
      const toast = await this.toastController.create({
        message: "Não foi possível copiar o link.",
        duration: 2000,
        color: "danger",
      });
      await toast.present();
    }
  }

  async showQRCode() {
    const event = this.event();
    if (!event) return;

    const alert = await this.alertController.create({
      header: "QR Code",
      message: `Código de partilha: ${event.shareCode}`,
      buttons: ["OK"],
    });
    await alert.present();
  }

  async openMaps() {
    const event = this.event();
    if (!event) return;

    if (event.venue.mapsUrl) {
      window.open(event.venue.mapsUrl, "_blank");
    } else if (event.venue.coordinates) {
      const { lat, lng } = event.venue.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } else {
      const address = encodeURIComponent(
        `${event.venue.name}, ${event.venue.address}, ${event.venue.city}`,
      );
      window.open(`https://www.google.com/maps/search/${address}`, "_blank");
    }
  }

  async exportGuests() {
    const csv = this.guestService.exportToCSV(this.eventId());
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `convidados_${this.event()?.title || "evento"}.csv`;
    link.click();

    URL.revokeObjectURL(url);

    const toast = await this.toastController.create({
      message: "Lista de convidados exportada!",
      duration: 2000,
      color: "success",
    });
    await toast.present();
  }

  async showMoreOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: "Opções",
      buttons: [
        {
          text: "Editar Evento",
          icon: "create-outline",
          handler: () => {
            this.navigateToEdit();
          },
        },
        {
          text: "Exportar Convidados (CSV)",
          icon: "document-text-outline",
          handler: () => {
            this.exportGuests();
          },
        },
        {
          text: "Ver Estatísticas",
          icon: "stats-chart-outline",
          handler: () => {
            this.navigateToStats();
          },
        },
        {
          text: "Cancelar",
          role: "cancel",
        },
      ],
    });

    await actionSheet.present();
  }
}
