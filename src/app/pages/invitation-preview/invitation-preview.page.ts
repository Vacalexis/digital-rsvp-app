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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  shareOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  personOutline,
  peopleOutline,
  homeOutline,
  arrowForwardOutline,
  arrowBackOutline,
  createOutline,
  eyeOutline,
} from "ionicons/icons";

import { EventService } from "@services/event.service";
import { InvitationType, INVITATION_TYPES } from "@models/index";
import { InvitationCardComponent } from "@components/invitation-card/invitation-card.component";
import {
  DietarySelectComponent,
  DietaryValue,
} from "@components/dietary-select/dietary-select.component";
import { EnvelopeOpenerComponent } from "@components/envelope-opener/envelope-opener.component";
import { formatDatePT } from "@utils/date.utils";

interface PreviewConfig {
  type: InvitationType;
  primaryName: string;
  secondaryName: string;
  childrenCount: number;
  allowPlusOne: boolean;
}

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    InvitationCardComponent,
    DietarySelectComponent,
    EnvelopeOpenerComponent,
  ],
  templateUrl: "./invitation-preview.page.html",
  styleUrls: ["./invitation-preview.page.scss"],
})
export class InvitationPreviewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  eventId = signal<string>("");
  event = computed(() => this.eventService.getEventById(this.eventId()));

  // Three-phase preview: setup → envelope → preview
  currentPhase = signal<"setup" | "envelope" | "preview">("setup");
  
  // Envelope opened state
  envelopeOpened = signal(false);

  // Preview configuration
  config: PreviewConfig = {
    type: "single",
    primaryName: "",
    secondaryName: "",
    childrenCount: 2,
    allowPlusOne: true,
  };

  // Template presets for quick selection
  readonly templates = [
    {
      id: "single",
      type: "single" as InvitationType,
      icon: "person-outline",
      label: "Individual",
      description: "Um convidado",
      defaults: { primaryName: "Maria Silva", secondaryName: "", childrenCount: 0, allowPlusOne: true },
    },
    {
      id: "couple",
      type: "couple" as InvitationType,
      icon: "people-outline",
      label: "Casal",
      description: "Dois convidados",
      defaults: { primaryName: "Maria Silva", secondaryName: "João Costa", childrenCount: 0, allowPlusOne: false },
    },
    {
      id: "family",
      type: "family" as InvitationType,
      icon: "home-outline",
      label: "Família",
      description: "Casal + filhos",
      defaults: { primaryName: "Maria Silva", secondaryName: "João Costa", childrenCount: 2, allowPlusOne: false },
    },
  ];

  selectedTemplate = signal<string>("single");

  // RSVP preview state (local only, for realistic preview)
  attendingPreview: "yes" | "no" | "maybe" = "yes";
  bringingPlusOnePreview = false;
  plusOneNamePreview = "";
  songRequestPreview = "";
  messagePreview = "";

  // Dietary values
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
      personOutline,
      peopleOutline,
      homeOutline,
      arrowForwardOutline,
      arrowBackOutline,
      createOutline,
      eyeOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.eventId.set(id);
    }
    // Apply default template
    this.selectTemplate("single");
  }

  // Template selection
  selectTemplate(templateId: string) {
    const template = this.templates.find((t) => t.id === templateId);
    if (template) {
      this.selectedTemplate.set(templateId);
      this.config.type = template.type;
      this.config.primaryName = template.defaults.primaryName;
      this.config.secondaryName = template.defaults.secondaryName;
      this.config.childrenCount = template.defaults.childrenCount;
      this.config.allowPlusOne = template.defaults.allowPlusOne;
    }
  }

  // Phase navigation
  startPreview() {
    // Validate required fields
    if (!this.config.primaryName.trim()) {
      this.config.primaryName = "Convidado";
    }
    if (this.showSecondaryGuest() && !this.config.secondaryName.trim()) {
      this.config.secondaryName = "Acompanhante";
    }
    
    // Reset RSVP state for fresh preview
    this.attendingPreview = "yes";
    this.bringingPlusOnePreview = false;
    this.secondaryAttendingPreview = true;
    this.childrenAttendingPreview = this.config.childrenCount;
    
    this.currentPhase.set("envelope");
  }

  // Called when envelope animation completes
  onEnvelopeOpened() {
    this.envelopeOpened.set(true);
    this.currentPhase.set("preview");
  }

  backToSetup() {
    this.currentPhase.set("setup");
    this.envelopeOpened.set(false);
  }

  // Computed helpers
  showSecondaryGuest(): boolean {
    return this.config.type === "couple" || this.config.type === "family";
  }

  showPlusOneOption(): boolean {
    return (
      this.config.type === "single" && 
      this.config.allowPlusOne && 
      (this.event()?.allowPlusOne || false)
    );
  }

  showChildrenSection(): boolean {
    return (
      this.config.type === "family" && (this.event()?.askChildrenInfo || false)
    );
  }

  formatDate(dateStr: string): string {
    return formatDatePT(dateStr);
  }

  getChildrenOptions(): number[] {
    return Array.from({ length: this.config.childrenCount + 1 }, (_, i) => i);
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

  // Get greeting text based on config
  getGreetingNames(): string {
    if (this.config.type === "single") {
      return this.config.primaryName;
    } else if (this.config.type === "couple") {
      return `${this.config.primaryName} & ${this.config.secondaryName}`;
    } else {
      return `${this.config.primaryName} & ${this.config.secondaryName}`;
    }
  }

  getGreetingSubtext(): string {
    if (this.config.type === "single") {
      return "Estás convidado/a para o nosso evento!";
    } else if (this.config.type === "family" && this.config.childrenCount > 0) {
      return `e família, estão convidados para o nosso evento!`;
    } else {
      return "Estão convidados para o nosso evento!";
    }
  }
}
