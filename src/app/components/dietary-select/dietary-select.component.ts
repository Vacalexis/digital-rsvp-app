/**
 * DietarySelectComponent
 *
 * Reusable component for selecting dietary restrictions.
 * Includes select dropdown with predefined options and textarea for "other".
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from "@angular/forms";
import {
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from "@ionic/angular/standalone";

import { DIETARY_OPTIONS, DietaryOption } from "@models/index";

export interface DietaryValue {
  choice: string;
  other: string;
}

@Component({
  selector: "app-dietary-select",
  standalone: true,
  imports: [CommonModule, FormsModule, IonSelect, IonSelectOption, IonTextarea],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DietarySelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="dietary-select">
      @if (label) {
      <label class="dietary-label">{{ label }}</label>
      }

      <ion-select
        [value]="value.choice"
        (ionChange)="onChoiceChange($event)"
        interface="popover"
        [placeholder]="placeholder"
        fill="outline"
      >
        @for (option of options; track option.value) {
        <ion-select-option [value]="option.value">
          {{ option.label }}
        </ion-select-option>
        }
      </ion-select>

      @if (value.choice === 'other') {
      <ion-textarea
        [value]="value.other"
        (ionInput)="onOtherChange($event)"
        placeholder="Escreve aqui…"
        fill="outline"
        [autoGrow]="true"
        rows="2"
        class="other-textarea"
      >
      </ion-textarea>
      }
    </div>
  `,
  styles: [
    `
      .dietary-select {
        width: 100%;
      }

      .dietary-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--invitation-text, #1f2937);
      }

      ion-select {
        --border-radius: 12px;
        --background: rgba(255, 255, 255, 0.78);
        --border-color: rgba(31, 41, 55, 0.14);
        --padding-start: 12px;
        --padding-end: 12px;
      }

      .other-textarea {
        margin-top: 10px;
        --border-radius: 12px;
        --background: rgba(255, 255, 255, 0.78);
        --border-color: rgba(31, 41, 55, 0.14);
      }
    `,
  ],
})
export class DietarySelectComponent implements ControlValueAccessor {
  @Input() label = "";
  @Input() placeholder = "Seleciona uma opção";

  options: DietaryOption[] = DIETARY_OPTIONS;

  value: DietaryValue = { choice: "none", other: "" };

  private onChange: (value: DietaryValue) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: DietaryValue | null): void {
    this.value = value ?? { choice: "none", other: "" };
  }

  registerOnChange(fn: (value: DietaryValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onChoiceChange(event: CustomEvent): void {
    this.value = { ...this.value, choice: event.detail.value };
    this.onChange(this.value);
    this.onTouched();
  }

  onOtherChange(event: CustomEvent): void {
    this.value = { ...this.value, other: event.detail.value || "" };
    this.onChange(this.value);
  }

  /**
   * Get the formatted dietary restriction string
   */
  getFormattedValue(): string {
    if (!this.value.choice || this.value.choice === "none") return "";
    if (this.value.choice === "other") return this.value.other?.trim() || "";
    const option = this.options.find((o) => o.value === this.value.choice);
    return option?.label || this.value.choice;
  }
}
