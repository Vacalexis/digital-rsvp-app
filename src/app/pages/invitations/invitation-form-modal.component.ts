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
  IonIcon,
  ModalController,
  ToastController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { trashOutline, addOutline } from "ionicons/icons";

import {
  InvitationService,
  CreateInvitationData,
} from "@services/invitation.service";
import {
  Invitation,
  InvitationType,
  InvitedChild,
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
    IonIcon,
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

        <!-- Guest 1 (renamed from Primary for equality) -->
        <ion-item class="section-header">
          <ion-label>
            <h2>{{ showSecondaryGuest() ? "Convidado 1" : "Convidado" }}</h2>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-input
            label="Nome"
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

        <!-- Guest 2 (for couples/family - equal treatment) -->
        @if (showSecondaryGuest()) {
          <ion-item class="section-header">
            <ion-label>
              <h2>Convidado 2</h2>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-input
              label="Nome"
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

        <!-- Allow Plus One - ALWAYS visible, Host decides -->
        <ion-item class="section-header">
          <ion-label>
            <h2>Opções</h2>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-toggle [(ngModel)]="allowPlusOne">
            Permitir Acompanhante
          </ion-toggle>
        </ion-item>
        <ion-note class="ion-padding-horizontal">
          Se ativado, o convidado poderá adicionar um acompanhante no RSVP.
        </ion-note>

        <!-- Children (for family type) - Name and optional age -->
        @if (showChildrenOption()) {
          <ion-item class="section-header">
            <ion-label>
              <h2>Filhos</h2>
              <p>Adicione cada filho com nome e idade (opcional)</p>
            </ion-label>
          </ion-item>

          @for (child of childrenList; track $index) {
            <div class="child-row">
              <ion-item class="child-name-item">
                <ion-input
                  [label]="'Filho ' + ($index + 1)"
                  labelPlacement="stacked"
                  placeholder="Nome"
                  [(ngModel)]="childrenList[$index].name"
                ></ion-input>
              </ion-item>
              <ion-item class="child-age-item">
                <ion-input
                  label="Idade"
                  labelPlacement="stacked"
                  type="number"
                  placeholder="?"
                  min="0"
                  max="18"
                  [(ngModel)]="childrenList[$index].age"
                ></ion-input>
              </ion-item>
              <ion-button
                fill="clear"
                color="danger"
                class="remove-child-btn"
                (click)="removeChild($index)"
              >
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          }

          <ion-note class="ion-padding-horizontal">
            Se não souber a idade, deixe em branco. O convidado indicará no
            RSVP.
          </ion-note>

          <ion-button
            fill="outline"
            expand="block"
            (click)="addChild()"
            class="add-child-btn"
          >
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Adicionar Filho
          </ion-button>
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
      .child-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        margin-bottom: 0.5rem;
      }

      .child-name-item {
        flex: 1;
        --background: white;
        border-radius: 8px;
      }

      .child-age-item {
        width: 70px;
        flex-shrink: 0;
        --background: white;
        border-radius: 8px;
      }

      .remove-child-btn {
        height: 48px;
        margin-bottom: 2px;
      }
      .add-child-btn {
        margin-top: 0.5rem;
        --border-radius: 8px;
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
  childrenList: InvitedChild[] = []; // Individual children with name and optional age

  constructor() {
    addIcons({ trashOutline, addOutline });
  }

  get isEditing(): boolean {
    return !!this.invitation;
  }

  get childrenCount(): number {
    return this.childrenList.length;
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
    // Load children
    if (inv.children && inv.children.length > 0) {
      this.childrenList = inv.children.map((c) => ({ ...c }));
    } else {
      this.childrenList = [];
    }
  }

  addChild() {
    this.childrenList.push({ name: "", age: undefined });
  }

  removeChild(index: number) {
    this.childrenList.splice(index, 1);
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
      if (this.showChildrenOption() && this.childrenList.length > 0) {
        const validChildren = this.childrenList
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            age: c.age ?? undefined,
          }));
        if (validChildren.length > 0) {
          data.children = validChildren;
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
