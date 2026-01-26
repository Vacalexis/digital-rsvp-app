import {
  Component,
  inject,
  signal,
  computed,
  Input,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonNote,
  IonSpinner,
  ModalController,
  ToastController,
} from "@ionic/angular/standalone";

import {
  InvitationService,
  CreateInvitationData,
} from "@services/invitation.service";
import {
  Invitation,
  InvitationType,
  INVITATION_TYPES,
  Event,
} from "@models/index";

@Component({
  selector: "app-invitation-form-modal",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonNote,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-title>{{
          isEditing ? "Editar Convite" : "Novo Convite"
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [strong]="true" [disabled]="saving()">
            @if (saving()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Guardar
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <!-- Invitation Type -->
        <ion-item>
          <ion-select
            label="Tipo de Convite"
            labelPlacement="stacked"
            [(ngModel)]="invitationType"
            (ionChange)="onTypeChange()"
          >
            @for (type of invitationTypes; track type.value) {
              <ion-select-option [value]="type.value">
                {{ type.label }} - {{ type.description }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>

        <!-- Primary Guest -->
        <ion-item>
          <ion-input
            label="Nome do Convidado Principal"
            labelPlacement="stacked"
            placeholder="Ex: João Silva"
            [(ngModel)]="primaryGuestName"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            label="Email (opcional)"
            labelPlacement="stacked"
            type="email"
            placeholder="joao@email.com"
            [(ngModel)]="primaryGuestEmail"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            label="Telefone (opcional)"
            labelPlacement="stacked"
            type="tel"
            placeholder="+351 912 345 678"
            [(ngModel)]="primaryGuestPhone"
          ></ion-input>
        </ion-item>

        <!-- Secondary Guest (for couples) -->
        @if (showSecondaryGuest()) {
          <ion-item class="section-header">
            <ion-label>
              <h2>Segundo Convidado</h2>
              <p>Para casais ou convites duplos</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-input
              label="Nome do Segundo Convidado"
              labelPlacement="stacked"
              placeholder="Ex: Maria Silva"
              [(ngModel)]="secondaryGuestName"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              label="Email (opcional)"
              labelPlacement="stacked"
              type="email"
              placeholder="maria@email.com"
              [(ngModel)]="secondaryGuestEmail"
            ></ion-input>
          </ion-item>
        }

        <!-- Allow Plus One -->
        @if (showPlusOneOption()) {
          <ion-item>
            <ion-toggle [(ngModel)]="allowPlusOne">
              Permitir Acompanhante
            </ion-toggle>
          </ion-item>
          <ion-note class="ion-padding-horizontal">
            O convidado poderá trazer um acompanhante adicional.
          </ion-note>
        }

        <!-- Children (for family type) -->
        @if (showChildrenOption()) {
          <ion-item class="section-header">
            <ion-label>
              <h2>Filhos</h2>
              <p>Número de crianças incluídas no convite</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-input
              label="Número de Filhos"
              labelPlacement="stacked"
              type="number"
              min="0"
              max="10"
              [(ngModel)]="childrenCount"
            ></ion-input>
          </ion-item>

          @if (childrenCount > 0) {
            <ion-item>
              <ion-input
                label="Nomes dos Filhos (opcional)"
                labelPlacement="stacked"
                placeholder="Ex: Pedro, Ana"
                [(ngModel)]="childrenNamesText"
              ></ion-input>
            </ion-item>
            <ion-note class="ion-padding-horizontal">
              Separe os nomes por vírgula.
            </ion-note>
          }
        }
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      ion-list {
        background: transparent;
      }

      ion-item {
        --background: white;
        margin-bottom: 0.5rem;
        border-radius: 8px;
      }

      .section-header {
        --background: transparent;
        --padding-start: 0;
        margin-top: 1rem;

        h2 {
          font-weight: 600;
          font-size: 1rem;
          margin: 0;
        }

        p {
          color: var(--ion-color-medium);
          font-size: 0.875rem;
        }
      }

      ion-note {
        display: block;
        font-size: 0.75rem;
        color: var(--ion-color-medium);
        margin-bottom: 0.5rem;
      }

      ion-spinner {
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class InvitationFormModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private invitationService = inject(InvitationService);
  private toastController = inject(ToastController);

  @Input() eventId!: string;
  @Input() event?: Event;
  @Input() invitation?: Invitation;

  invitationTypes = INVITATION_TYPES;
  saving = signal(false);

  // Form fields
  invitationType: InvitationType = "single";
  primaryGuestName = "";
  primaryGuestEmail = "";
  primaryGuestPhone = "";
  secondaryGuestName = "";
  secondaryGuestEmail = "";
  allowPlusOne = false;
  childrenCount = 0;
  childrenNamesText = "";

  get isEditing(): boolean {
    return !!this.invitation;
  }

  showSecondaryGuest = computed(() => {
    return (
      this.invitationType === "couple" ||
      this.invitationType === "family" ||
      this.invitationType === "group"
    );
  });

  showPlusOneOption = computed(() => {
    return (
      this.invitationType === "single" ||
      this.invitationType === "single-plus-one"
    );
  });

  showChildrenOption = computed(() => {
    return this.invitationType === "family";
  });

  ngOnInit() {
    if (this.invitation) {
      this.loadInvitation(this.invitation);
    } else if (this.event?.allowPlusOne) {
      // Default to allowing plus one if event allows it
      this.allowPlusOne = true;
    }
  }

  private loadInvitation(inv: Invitation) {
    this.invitationType = inv.invitationType;
    this.primaryGuestName = inv.primaryGuest.name;
    this.primaryGuestEmail = inv.primaryGuest.email || "";
    this.primaryGuestPhone = inv.primaryGuest.phone || "";
    this.secondaryGuestName = inv.secondaryGuest?.name || "";
    this.secondaryGuestEmail = inv.secondaryGuest?.email || "";
    this.allowPlusOne = inv.allowPlusOne;
    this.childrenCount = inv.childrenCount || 0;
    this.childrenNamesText = inv.childrenNames?.join(", ") || "";
  }

  onTypeChange() {
    // Reset plus one based on type
    if (this.invitationType === "single-plus-one") {
      this.allowPlusOne = true;
    } else if (
      this.invitationType === "couple" ||
      this.invitationType === "family"
    ) {
      this.allowPlusOne = false;
    }
  }

  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }

  async save() {
    if (!this.primaryGuestName.trim()) {
      await this.showToast("O nome do convidado é obrigatório", "warning");
      return;
    }

    this.saving.set(true);

    try {
      const data: CreateInvitationData = {
        eventId: this.eventId,
        invitationType: this.invitationType,
        primaryGuest: {
          name: this.primaryGuestName.trim(),
          email: this.primaryGuestEmail.trim() || undefined,
          phone: this.primaryGuestPhone.trim() || undefined,
        },
        allowPlusOne: this.allowPlusOne,
      };

      // Add secondary guest if applicable
      if (this.showSecondaryGuest() && this.secondaryGuestName.trim()) {
        data.secondaryGuest = {
          name: this.secondaryGuestName.trim(),
          email: this.secondaryGuestEmail.trim() || undefined,
        };
      }

      // Add children if applicable
      if (this.showChildrenOption() && this.childrenCount > 0) {
        data.childrenCount = this.childrenCount;
        if (this.childrenNamesText.trim()) {
          data.childrenNames = this.childrenNamesText
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n);
        }
      }

      if (this.isEditing && this.invitation) {
        const updated = await this.invitationService.updateInvitation(
          this.invitation.id,
          data,
        );
        if (updated) {
          this.dismiss({ updated: true });
        } else {
          await this.showToast("Erro ao atualizar convite", "danger");
        }
      } else {
        const created = await this.invitationService.createInvitation(data);
        if (created) {
          this.dismiss({ created: true });
        } else {
          await this.showToast("Erro ao criar convite", "danger");
        }
      }
    } catch (error) {
      console.error("Error saving invitation:", error);
      await this.showToast("Erro ao guardar convite", "danger");
    } finally {
      this.saving.set(false);
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
