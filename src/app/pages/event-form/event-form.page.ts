import { Component, inject, signal, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
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
  IonSpinner,
  ToastController,
  AlertController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  saveOutline,
  calendarOutline,
  locationOutline,
  peopleOutline,
  colorPaletteOutline,
  settingsOutline,
  addOutline,
  trashOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import {
  Event,
  EventType,
  InvitationTheme,
  EVENT_TYPES,
  INVITATION_THEMES,
  ScheduleItem,
} from "@models/index";

@Component({
  selector: "app-event-form",
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
    IonSpinner,
  ],
  templateUrl: "./event-form.page.html",
  styleUrls: ["./event-form.page.scss"],
})
export class EventFormPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  isEdit = signal(false);
  eventId = signal<string | null>(null);
  saving = signal(false);

  // Form fields
  title = "";
  subtitle = "";
  description = "";
  coverImage: string | null = null;
  eventType: EventType = "wedding";
  date = new Date().toISOString();
  time = "";
  endDate = "";
  endTime = "";

  // Venue
  venueName = "";
  venueAddress = "";
  venueCity = "";
  venueCountry = "Portugal";
  venueMapsUrl = "";

  // Settings
  hosts: string[] = [];
  theme: InvitationTheme = "elegant";
  language = "pt";
  rsvpDeadline = "";
  maxGuests: number | undefined;
  allowPlusOne = true;
  askDietaryRestrictions = true;
  askSongRequest = false;
  askChildrenInfo = false;

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
    const id = this.route.snapshot.paramMap.get("id");
    if (id && id !== "new") {
      this.eventId.set(id);
      this.isEdit.set(true);
      this.loadEvent(id);
    } else {
      this.applyDefaultNewEvent();
    }
  }

  private applyDefaultNewEvent() {
    // Valores default vazios para novo evento
    this.title = "";
    this.subtitle = "";
    this.description = "";
    this.eventType = "wedding";
    this.date = new Date().toISOString();
    this.time = "";
    this.endTime = "";
    this.venueName = "";
    this.venueAddress = "";
    this.venueCity = "";
    this.venueCountry = "Portugal";
    this.venueMapsUrl = "";
    this.hosts = [];
    this.theme = "elegant";
    this.language = "pt";
    this.allowPlusOne = true;
    this.askDietaryRestrictions = true;
    this.askSongRequest = false;
    this.askChildrenInfo = false;
    this.schedule = [];
  }

  loadEvent(id: string) {
    const event = this.eventService.getEventById(id);
    if (event) {
      this.title = event.title;
      this.subtitle = event.subtitle || "";
      this.description = event.description || "";
      this.coverImage = event.coverImage || null;
      this.eventType = event.eventType;
      this.date = event.date;
      this.time = event.time || "";
      this.endDate = event.endDate || "";
      this.endTime = event.endTime || "";
      this.venueName = event.venue.name;
      this.venueAddress = event.venue.address;
      this.venueCity = event.venue.city;
      this.venueCountry = event.venue.country;
      this.venueMapsUrl = event.venue.mapsUrl || "";
      this.hosts = [...event.hosts];
      this.theme = event.theme;
      this.language = event.language;
      this.rsvpDeadline = event.rsvpDeadline || "";
      this.maxGuests = event.maxGuests;
      this.allowPlusOne = event.allowPlusOne;
      this.askDietaryRestrictions = event.askDietaryRestrictions;
      this.askSongRequest = event.askSongRequest;
      this.askChildrenInfo = event.askChildrenInfo ?? false;
      this.schedule = event.schedule ? [...event.schedule] : [];
    }
  }

  async onCoverFileSelected(domEvent: globalThis.Event): Promise<void> {
    const input = domEvent.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await this.showValidationError(
        "Por favor seleciona um ficheiro de imagem.",
      );
      input.value = "";
      return;
    }

    try {
      const dataUrl = await this.compressImageFile(file);
      this.coverImage = dataUrl;

      const toast = await this.toastController.create({
        message: "Fotografia carregada.",
        duration: 1800,
        color: "success",
      });
      await toast.present();
    } catch {
      await this.showValidationError(
        "Não foi possível processar a fotografia. Tenta outra imagem.",
      );
    } finally {
      input.value = "";
    }
  }

  removeCoverImage(): void {
    this.coverImage = null;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read_failed"));
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") resolve(result);
        else reject(new Error("read_failed"));
      };
      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("img_failed"));
      img.src = src;
    });
  }

  private async compressImageFile(file: File): Promise<string> {
    const original = await this.readFileAsDataUrl(file);
    const img = await this.loadImage(original);

    const maxSide = 1400;
    const { width, height } = img;

    const scale = Math.min(1, maxSide / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // JPEG gives predictable size + good quality for photos
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async addHost() {
    const alert = await this.alertController.create({
      header: "Adicionar Anfitrião",
      inputs: [
        {
          name: "name",
          type: "text",
          placeholder: "Nome do anfitrião",
        },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Adicionar",
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
      header: "Adicionar ao Programa",
      inputs: [
        {
          name: "time",
          type: "time",
          placeholder: "Hora",
        },
        {
          name: "title",
          type: "text",
          placeholder: "Título (ex: Cerimónia)",
        },
        {
          name: "description",
          type: "text",
          placeholder: "Descrição (opcional)",
        },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Adicionar",
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

    this.saving.set(true);

    const eventData = {
      title: this.title.trim(),
      subtitle: this.subtitle?.trim() || undefined,
      description: this.description?.trim() || undefined,
      coverImage: this.coverImage || undefined,
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
      askChildrenInfo: this.askChildrenInfo,
      schedule: this.schedule.length > 0 ? this.schedule : undefined,
    };

    try {
      if (this.isEdit() && this.eventId()) {
        await this.eventService.updateEvent(this.eventId()!, eventData);
        await this.eventService.loadEvents();
      } else {
        await this.eventService.createEvent(
          eventData as Omit<
            Event,
            "id" | "shareCode" | "createdAt" | "updatedAt"
          >,
        );
        await this.eventService.loadEvents();
      }

      const toast = await this.toastController.create({
        message: this.isEdit()
          ? "Evento atualizado!"
          : "Evento criado com sucesso!",
        duration: 2000,
        color: "success",
      });
      await toast.present();

      this.router.navigate(["/events"]);
    } catch {
      const toast = await this.toastController.create({
        message: "Erro ao guardar o evento.",
        duration: 2000,
        color: "danger",
      });
      await toast.present();
    } finally {
      this.saving.set(false);
    }
  }

  validateForm(): boolean {
    if (!this.title?.trim()) {
      this.showValidationError("O título é obrigatório.");
      return false;
    }
    if (!this.date) {
      this.showValidationError("A data é obrigatória.");
      return false;
    }
    if (!this.venueName?.trim()) {
      this.showValidationError("O nome do local é obrigatório.");
      return false;
    }
    if (!this.venueCity?.trim()) {
      this.showValidationError("A cidade é obrigatória.");
      return false;
    }
    return true;
  }

  async showValidationError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: "warning",
    });
    await toast.present();
  }
}
