import { Component, inject, signal, computed, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  AlertController,
  ToastController,
  ModalController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  addOutline,
  personOutline,
  peopleOutline,
  trashOutline,
  copyOutline,
  mailOutline,
  checkmarkCircleOutline,
  timeOutline,
  createOutline,
  linkOutline,
  searchOutline,
  eyeOutline,
} from "ionicons/icons";

import { InvitationService } from "@services/invitation.service";
import { EventService } from "@services/event.service";
import {
  Invitation,
  InvitationType,
  INVITATION_TYPES,
  Event,
} from "@models/index";
import { InvitationFormModalComponent } from "./invitation-form-modal.component";

@Component({
  selector: "app-invitations",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
  ],
  templateUrl: "./invitations.page.html",
  styleUrls: ["./invitations.page.scss"],
})
export class InvitationsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(InvitationService);
  private eventService = inject(EventService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);

  eventId = signal<string>("");
  event = signal<Event | null>(null);
  loading = signal<boolean>(false);
  searchTerm = signal<string>("");
  filterStatus = signal<"all" | "pending" | "submitted">("all");

  invitations = computed(() => this.invitationService.invitations());

  filteredInvitations = computed(() => {
    let list = this.invitations();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    // Filter by search term
    if (search) {
      list = list.filter(
        (inv) =>
          inv.primaryGuest.name.toLowerCase().includes(search) ||
          inv.secondaryGuest?.name.toLowerCase().includes(search) ||
          inv.shareCode.toLowerCase().includes(search),
      );
    }

    // Filter by status
    if (status === "pending") {
      list = list.filter((inv) => !inv.rsvpSubmitted);
    } else if (status === "submitted") {
      list = list.filter((inv) => inv.rsvpSubmitted);
    }

    return list;
  });

  stats = computed(() => {
    const all = this.invitations();
    return {
      total: all.length,
      pending: all.filter((inv) => !inv.rsvpSubmitted).length,
      submitted: all.filter((inv) => inv.rsvpSubmitted).length,
    };
  });

  constructor() {
    addIcons({
      mailOutline,
      addOutline,
      searchOutline,
      linkOutline,
      checkmarkCircleOutline,
      timeOutline,
      eyeOutline,
      copyOutline,
      trashOutline,
      personOutline,
      peopleOutline,
      createOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.eventId.set(id);
      this.loadData(id);
    }
  }

  private async loadData(eventId: string) {
    this.loading.set(true);
    try {
      await this.eventService.ensureEventLoaded(eventId);
      const loadedEvent = this.eventService.getEventById(eventId);
      this.event.set(loadedEvent ?? null);
      await this.invitationService.loadInvitationsByEvent(eventId);
    } finally {
      this.loading.set(false);
    }
  }

  getInvitationTypeLabel(type: InvitationType): string {
    return INVITATION_TYPES.find((t) => t.value === type)?.label || type;
  }

  getInvitationIcon(type: InvitationType): string {
    switch (type) {
      case "single":
      case "single-plus-one":
        return "person-outline";
      default:
        return "people-outline";
    }
  }

  getInviteeNames(inv: Invitation): string {
    let names = inv.primaryGuest.name;
    if (inv.secondaryGuest?.name) {
      names += ` & ${inv.secondaryGuest.name}`;
    }
    const childrenCount = inv.children?.length || 0;
    if (childrenCount > 0) {
      names += ` (+${childrenCount} filho${childrenCount > 1 ? "s" : ""})`;
    }
    return names;
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.detail.value || "");
  }

  onFilterChange(event: any) {
    this.filterStatus.set(event.detail.value || "all");
  }

  async openCreateModal() {
    const modal = await this.modalController.create({
      component: InvitationFormModalComponent,
      componentProps: {
        eventId: this.eventId(),
        event: this.event(),
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.created) {
      await this.showToast("Convite criado com sucesso!", "success");
    }
  }

  async openEditModal(invitation: Invitation) {
    const modal = await this.modalController.create({
      component: InvitationFormModalComponent,
      componentProps: {
        eventId: this.eventId(),
        event: this.event(),
        invitation,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      await this.showToast("Convite atualizado!", "success");
    }
  }

  async copyInvitationLink(invitation: Invitation) {
    const link = `${window.location.origin}/rsvp/${invitation.shareCode}`;

    try {
      await navigator.clipboard.writeText(link);
      await this.showToast("Link copiado!", "success");
    } catch {
      await this.showToast("Erro ao copiar link", "danger");
    }
  }

  previewInvitation(invitation: Invitation) {
    // Abre o RSVP do convite específico numa nova aba
    const link = `${window.location.origin}/rsvp/${invitation.shareCode}`;
    window.open(link, "_blank");
  }

  async confirmDelete(invitation: Invitation) {
    const alert = await this.alertController.create({
      header: "Eliminar Convite",
      message: `Tem a certeza que pretende eliminar o convite de ${invitation.primaryGuest.name}?`,
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Eliminar",
          role: "destructive",
          handler: () => this.deleteInvitation(invitation),
        },
      ],
    });

    await alert.present();
  }

  private async deleteInvitation(invitation: Invitation) {
    const success = await this.invitationService.deleteInvitation(
      invitation.id,
    );
    if (success) {
      await this.showToast("Convite eliminado", "success");
    } else {
      await this.showToast("Erro ao eliminar convite", "danger");
    }
  }

  private async showToast(
    message: string,
    color: "success" | "danger" | "warning",
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
