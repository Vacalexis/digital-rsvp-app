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
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import { InvitationType, INVITATION_TYPES } from "@models/index";
import { InvitationCardComponent } from "@components/invitation-card/invitation-card.component";
import {
  DietarySelectComponent,
  DietaryValue,
} from "@components/dietary-select/dietary-select.component";
import { formatDatePT } from "@utils/date.utils";

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
    InvitationCardComponent,
    DietarySelectComponent,
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
  songRequestPreview = "";
  messagePreview = "";

  // Dietary values using new component model
  primaryDietary: DietaryValue = { choice: "none", other: "" };
  plusOneDietary: DietaryValue = { choice: "none", other: "" };
  secondaryDietary: DietaryValue = { choice: "none", other: "" };
  childrenDietary: DietaryValue = { choice: "none", other: "" };

  // Couple mode - secondary guest
  secondaryAttendingPreview = true;

  // Children mode
  childrenAttendingPreview = 0;

  constructor() {
    addIcons({
      shareOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      helpCircleOutline,
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

  formatDate(dateStr: string): string {
    return formatDatePT(dateStr);
  }

  getChildrenOptions(): number[] {
    return [0, 1, 2, 3, 4, 5];
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
