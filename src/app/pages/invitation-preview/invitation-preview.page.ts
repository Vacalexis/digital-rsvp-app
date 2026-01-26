import { Component, inject, computed, signal, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
  IonItem,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  shareOutline,
  calendarOutline,
  locationOutline,
  timeOutline,
  heartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import {
  Event,
  INVITATION_THEMES,
  InvitationType,
  INVITATION_TYPES,
} from "@models/index";

@Component({
  selector: "app-invitation-preview",
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonItem,
    IonButtons,
    IonBackButton,
    IonLabel,
    IonSegment,
    IonSegmentButton,
  ],
  templateUrl: "./invitation-preview.page.html",
  styleUrls: ["./invitation-preview.page.scss"],
})
export class InvitationPreviewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  eventId = signal<string>("");
  event = computed(() => this.eventService.getEventById(this.eventId()));

  // Preview mode selector - simulates different invitation types
  previewMode: InvitationType = "single";
  invitationTypes = INVITATION_TYPES;

  // Simulated invitation data
  simulatedPrimaryName = "Maria Silva";
  simulatedSecondaryName = "João Costa";
  simulatedChildrenCount = 2;

  // RSVP preview state (local only)
  attendingPreview: "yes" | "no" | "maybe" = "yes";
  bringingPlusOnePreview = false;
  plusOneNamePreview = "";
  dietaryChoicePreview: string = "none";
  dietaryOtherPreview = "";
  plusOneDietaryChoicePreview: string = "none";
  plusOneDietaryOtherPreview = "";
  songRequestPreview = "";
  messagePreview = "";

  // Couple mode - secondary guest
  secondaryAttendingPreview = true;
  secondaryDietaryChoicePreview: string = "none";
  secondaryDietaryOtherPreview = "";

  // Children mode
  childrenAttendingPreview = 0;
  childrenDietaryChoicePreview: string = "none";
  childrenDietaryOtherPreview = "";

  constructor() {
    addIcons({
      shareOutline,
      calendarOutline,
      timeOutline,
      locationOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      heartOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.eventId.set(id);
    }
  }

  // Computed helpers for preview mode
  showSecondaryGuest(): boolean {
    return this.previewMode === "couple" || this.previewMode === "family";
  }

  showPlusOneOption(): boolean {
    return (
      this.previewMode === "single-plus-one" ||
      (this.previewMode === "single" && (this.event()?.allowPlusOne || false))
    );
  }

  showChildrenSection(): boolean {
    return (
      this.previewMode === "family" && (this.event()?.askChildrenInfo || false)
    );
  }

  onPreviewModeChange() {
    // Reset relevant fields when mode changes
    this.bringingPlusOnePreview = false;
    this.secondaryAttendingPreview = true;
    this.childrenAttendingPreview =
      this.previewMode === "family" ? this.simulatedChildrenCount : 0;
  }

  getThemeColor(): string {
    const event = this.event();
    if (!event) return "#8b5a5a";
    return (
      INVITATION_THEMES.find((t) => t.value === event.theme)?.color || "#8b5a5a"
    );
  }

  getDisplayDate(dateStr?: string): string {
    if (!dateStr) return "";
    const formatted = this.formatDate(dateStr);
    return formatted || dateStr;
  }

  getMonogram(event: Event): string {
    const hosts = (event.hosts || [])
      .map((name) => name.trim())
      .filter(Boolean);

    if (hosts.length >= 2) {
      const first = hosts[0].charAt(0).toUpperCase();
      const second = hosts[1].charAt(0).toUpperCase();
      return `${first}&${second}`;
    }

    if (hosts.length === 1) {
      return hosts[0].charAt(0).toUpperCase();
    }

    return "♥";
  }

  getTimeLabel(event: Event): string | null {
    const startFromEvent = (event.time || "").trim();
    const startFromSchedule = (event.schedule?.[0]?.time || "").trim();
    const start = startFromEvent || startFromSchedule;
    const end = (event.endTime || "").trim();
    const normalizedEnd = end === "00:00" ? "" : end;

    if (start && normalizedEnd) return `${start} - ${normalizedEnd}`;
    if (start) return start;
    if (normalizedEnd) return `até ${normalizedEnd}`;
    return null;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
      // Handle ISO date strings from IonDatetime (e.g., "2026-03-14T00:00:00")
      // Extract just the date part if it contains 'T'
      const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const [year, month, day] = datePart.split("-").map(Number);

      if (!year || !month || !day) {
        return dateStr;
      }

      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleDateString("pt-PT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  getDaysUntil(): number {
    const event = this.event();
    if (!event) return 0;

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  shareInvitation() {
    const event = this.event();
    if (!event) return;

    const url = `${window.location.origin}/rsvp/${event.shareCode}`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Estás convidado(a) para ${event.title}!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  }
}
