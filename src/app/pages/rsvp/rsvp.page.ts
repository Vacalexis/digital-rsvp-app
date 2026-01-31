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
  Invitation,
  InvitationType,
} from "@models/index";
import { InvitationCardComponent } from "@components/invitation-card/invitation-card.component";
import {
  DietarySelectComponent,
  DietaryValue,
} from "@components/dietary-select/dietary-select.component";
import { EnvelopeOpenerComponent } from "@components/envelope-opener/envelope-opener.component";
import { formatDatePT } from "@utils/date.utils";

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
    InvitationCardComponent,
    DietarySelectComponent,
    EnvelopeOpenerComponent,
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
  envelopeOpened = signal(false); // envelope opening animation state

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
    return (inv?.children || []).length > 0;
  });

  // Computed: filhos sem idade preenchida
  childrenWithoutAge = computed(() => {
    const inv = this.invitation();
    if (!inv?.children) return [];
    return inv.children.filter(child => !child.age);
  });

  // Computed: tem filhos sem idade?
  hasChildrenWithoutAge = computed(() => this.childrenWithoutAge().length > 0);

  // Form - legacy mode only
  guestName = "";
  guestEmail = "";
  guestPhone = "";

  // Form - common
  attending: "yes" | "no" | "maybe" = "yes";
  bringingPlusOne = false;
  plusOneName = "";
  songRequest = "";
  message = "";

  // Dietary values using DietarySelectComponent
  primaryDietary: DietaryValue = { choice: "none", other: "" };
  plusOneDietary: DietaryValue = { choice: "none", other: "" };
  secondaryDietary: DietaryValue = { choice: "none", other: "" };
  childrenDietary: DietaryValue = { choice: "none", other: "" };

  // Form - couple mode (second guest response)
  secondaryAttending = true;

  // Form - children
  childrenAttending = 0;
  childAges: { [childName: string]: number | undefined } = {};

  constructor() {
    addIcons({
      heartOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
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
          if (result.invitation.children && result.invitation.children.length > 0) {
            this.childrenAttending = result.invitation.children.length;
            // Initialize childAges for children without ages
            result.invitation.children.forEach(child => {
              if (!child.age) {
                this.childAges[child.name] = undefined;
              }
            });
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

  formatDate(dateStr: string): string {
    return formatDatePT(dateStr);
  }

  onEnvelopeOpened(): void {
    this.envelopeOpened.set(true);
  }

  getChildrenOptions(): number[] {
    return [0, 1, 2, 3, 4, 5];
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

    const dietaryRestrictions = this.getDietaryRestrictions(this.primaryDietary);
    const plusOneDietaryRestrictions = this.getDietaryRestrictions(this.plusOneDietary);
    const secondaryDietaryRestrictions = this.getDietaryRestrictions(this.secondaryDietary);
    const childrenDietaryRestrictions = this.getDietaryRestrictions(this.childrenDietary);

    // Build custom answers with all dietary info
    const customAnswers: Record<string, string> = {
      dietaryChoice: this.primaryDietary.choice,
      dietaryOther: this.primaryDietary.other?.trim() || "",
    };

    if (this.bringingPlusOne || this.invitationType() === "single-plus-one") {
      customAnswers["plusOneDietaryChoice"] = this.plusOneDietary.choice;
      customAnswers["plusOneDietaryOther"] =
        this.plusOneDietary.other?.trim() || "";
      customAnswers["plusOneDietaryRestrictions"] =
        plusOneDietaryRestrictions || "";
    }

    if (this.invitationType() === "couple") {
      customAnswers["secondaryGuestName"] = inv?.secondaryGuest?.name || "";
      customAnswers["secondaryAttending"] = this.secondaryAttending
        ? "yes"
        : "no";
      customAnswers["secondaryDietaryChoice"] = this.secondaryDietary.choice;
      customAnswers["secondaryDietaryOther"] =
        this.secondaryDietary.other?.trim() || "";
      customAnswers["secondaryDietaryRestrictions"] =
        secondaryDietaryRestrictions || "";
    }

    if (this.hasChildren()) {
      customAnswers["childrenAttending"] = String(this.childrenAttending);
      customAnswers["childrenNames"] = (inv?.children || [])
        .map((c) => c.name)
        .join(", ");
      
      // Add children ages if collected
      const childrenWithAges = (inv?.children || []).map(child => ({
        name: child.name,
        age: this.childAges[child.name] ?? child.age
      }));
      if (childrenWithAges.some(c => c.age !== undefined)) {
        customAnswers["childrenAges"] = JSON.stringify(childrenWithAges);
      }
      customAnswers["childrenDietaryChoice"] = this.childrenDietary.choice;
      customAnswers["childrenDietaryOther"] =
        this.childrenDietary.other?.trim() || "";
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

  private getDietaryRestrictions(dietary: DietaryValue): string {
    const { choice, other } = dietary;
    const normalizedOther = (other || "").trim();

    if (!choice || choice === "none") return "";
    if (choice === "other") return normalizedOther;

    return choice;
  }
}
