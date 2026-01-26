import { Component, inject, signal, OnInit, computed } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
  IonItem,
  ToastController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  heartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  calendarOutline,
  locationOutline,
  timeOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import { GuestService } from "@services/guest.service";
import {
  InvitationService,
  RsvpLookupResult,
} from "@services/invitation.service";
import {
  Event,
  RsvpStatus,
  INVITATION_THEMES,
  Invitation,
  InvitationType,
} from "@models/index";

@Component({
  selector: "app-rsvp",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonItem,
  ],
  templateUrl: "./rsvp.page.html",
  styleUrls: ["./rsvp.page.scss"],
})
export class RsvpPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private guestService = inject(GuestService);
  private invitationService = inject(InvitationService);
  private toastController = inject(ToastController);

  shareCode = signal<string>("");
  event = signal<Event | undefined>(undefined);
  invitation = signal<Invitation | undefined>(undefined);
  submitted = signal(false);
  response = signal<RsvpStatus | null>(null);
  isLegacyMode = signal(false); // true = evento sem invitation (pedir nome, etc.)

  // Computed: nome principal do convidado (do Invitation ou do form)
  primaryGuestName = computed(() => {
    const inv = this.invitation();
    if (inv) {
      return inv.primaryGuest.name;
    }
    return this.guestName;
  });

  // Computed: nome do segundo convidado (para casal)
  secondaryGuestName = computed(() => {
    const inv = this.invitation();
    return inv?.secondaryGuest?.name || "";
  });

  // Computed: tipo de convite
  invitationType = computed((): InvitationType => {
    return this.invitation()?.invitationType || "single";
  });

  // Computed: permite +1?
  allowsPlusOne = computed(() => {
    const inv = this.invitation();
    if (inv) return inv.allowPlusOne;
    return this.event()?.allowPlusOne || false;
  });

  // Computed: tem filhos no convite?
  hasChildren = computed(() => {
    const inv = this.invitation();
    return (inv?.childrenCount || 0) > 0;
  });

  // Form - legacy mode only
  guestName = "";
  guestEmail = "";
  guestPhone = "";

  // Form - common
  attending: "yes" | "no" | "maybe" = "yes";
  bringingPlusOne = false;
  plusOneName = "";
  dietaryChoice: string = "none";
  dietaryOther = "";
  plusOneDietaryChoice: string = "none";
  plusOneDietaryOther = "";
  songRequest = "";
  message = "";

  // Form - couple mode (second guest response)
  secondaryAttending = true;
  secondaryDietaryChoice: string = "none";
  secondaryDietaryOther = "";

  // Form - children
  childrenAttending = 0;
  childrenDietaryChoice: string = "none";
  childrenDietaryOther = "";

  constructor() {
    addIcons({
      heartOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
      calendarOutline,
      locationOutline,
      timeOutline,
    });
  }

  async ngOnInit() {
    const code = this.route.snapshot.paramMap.get("code");
    if (code) {
      this.shareCode.set(code);

      // Try new invitation system first
      const result = await this.invitationService.lookupByCode(code);

      if (result) {
        if (result.type === "invitation" && result.invitation && result.event) {
          // New system: personalized invitation
          this.invitation.set(result.invitation);
          this.event.set(result.event);
          this.isLegacyMode.set(false);

          // Pre-fill children count from invitation
          if (result.invitation.childrenCount) {
            this.childrenAttending = result.invitation.childrenCount;
          }
        } else if (result.type === "event" && result.event) {
          // Legacy: event-level shareCode
          this.event.set(result.event);
          this.isLegacyMode.set(true);
        }
      } else {
        // Fallback to old event service methods
        let foundEvent = this.eventService.getEventByShareCode(code);
        if (!foundEvent) {
          foundEvent = await this.eventService.getEventByShareCodeAsync(code);
        }
        if (foundEvent) {
          this.event.set(foundEvent);
          this.isLegacyMode.set(true);
        }
      }
    }
  }

  getThemeColor(): string {
    const evt = this.event();
    if (!evt) return "#8b5a5a";
    return (
      INVITATION_THEMES.find((t) => t.value === evt.theme)?.color || "#8b5a5a"
    );
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

  getDisplayDate(dateStr?: string): string {
    if (!dateStr) return "";
    const formatted = this.formatDate(dateStr);
    return formatted || dateStr;
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

  async submit() {
    const evt = this.event();
    const inv = this.invitation();

    // Get guest name from invitation or form
    const guestName = inv ? inv.primaryGuest.name : this.guestName?.trim();

    if (!evt || !guestName) {
      const toast = await this.toastController.create({
        message: "Por favor, preencha o seu nome.",
        duration: 2000,
        color: "warning",
      });
      await toast.present();
      return;
    }

    const rsvpStatus: RsvpStatus =
      this.attending === "yes"
        ? "confirmed"
        : this.attending === "no"
          ? "declined"
          : "maybe";

    const dietaryRestrictions = this.getDietaryRestrictions(
      this.dietaryChoice,
      this.dietaryOther,
    );
    const plusOneDietaryRestrictions = this.getDietaryRestrictions(
      this.plusOneDietaryChoice,
      this.plusOneDietaryOther,
    );
    const secondaryDietaryRestrictions = this.getDietaryRestrictions(
      this.secondaryDietaryChoice,
      this.secondaryDietaryOther,
    );
    const childrenDietaryRestrictions = this.getDietaryRestrictions(
      this.childrenDietaryChoice,
      this.childrenDietaryOther,
    );

    // Build custom answers with all dietary info
    const customAnswers: Record<string, string> = {
      dietaryChoice: this.dietaryChoice,
      dietaryOther: this.dietaryOther?.trim() || "",
    };

    if (this.bringingPlusOne || this.invitationType() === "single-plus-one") {
      customAnswers["plusOneDietaryChoice"] = this.plusOneDietaryChoice;
      customAnswers["plusOneDietaryOther"] =
        this.plusOneDietaryOther?.trim() || "";
      customAnswers["plusOneDietaryRestrictions"] =
        plusOneDietaryRestrictions || "";
    }

    if (this.invitationType() === "couple") {
      customAnswers["secondaryGuestName"] = inv?.secondaryGuest?.name || "";
      customAnswers["secondaryAttending"] = this.secondaryAttending
        ? "yes"
        : "no";
      customAnswers["secondaryDietaryChoice"] = this.secondaryDietaryChoice;
      customAnswers["secondaryDietaryOther"] =
        this.secondaryDietaryOther?.trim() || "";
      customAnswers["secondaryDietaryRestrictions"] =
        secondaryDietaryRestrictions || "";
    }

    if (this.hasChildren()) {
      customAnswers["childrenAttending"] = String(this.childrenAttending);
      customAnswers["childrenNames"] = (inv?.childrenNames || []).join(", ");
      customAnswers["childrenDietaryChoice"] = this.childrenDietaryChoice;
      customAnswers["childrenDietaryOther"] =
        this.childrenDietaryOther?.trim() || "";
      customAnswers["childrenDietaryRestrictions"] =
        childrenDietaryRestrictions || "";
    }

    await this.guestService.createGuest({
      eventId: evt.id,
      invitationId: inv?.id,
      name: guestName,
      email: inv?.primaryGuest.email || this.guestEmail?.trim() || undefined,
      phone: inv?.primaryGuest.phone || this.guestPhone?.trim() || undefined,
      rsvpStatus,
      rsvpDate: new Date().toISOString(),
      plusOne: this.bringingPlusOne,
      plusOneName: this.plusOneName?.trim() || undefined,
      plusOneConfirmed: this.bringingPlusOne,
      plusOneDietaryRestrictions: plusOneDietaryRestrictions || undefined,
      dietaryRestrictions: dietaryRestrictions || undefined,
      childrenAttending: this.hasChildren()
        ? this.childrenAttending
        : undefined,
      childrenDietaryRestrictions: childrenDietaryRestrictions || undefined,
      songRequest: this.songRequest?.trim() || undefined,
      notes: this.message?.trim() || undefined,
      customAnswers,
      invitationSent: true,
      reminderSent: false,
    });

    // Mark invitation as submitted
    if (inv) {
      await this.invitationService.submitRsvp(inv.id);
    }

    // Store name for thank-you message
    this.guestName = guestName;

    this.response.set(rsvpStatus);
    this.submitted.set(true);
  }

  private getDietaryRestrictions(choice: string, otherText: string): string {
    const normalizedOther = (otherText || "").trim();

    if (!choice || choice === "none") return "";
    if (choice === "other") return normalizedOther;

    return choice;
  }
}
