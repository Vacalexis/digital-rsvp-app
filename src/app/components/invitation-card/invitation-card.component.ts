/**
 * InvitationCardComponent
 *
 * Visual component for displaying invitation cards with envelope, crest, and event details.
 * Used by both invitation-preview (admin) and rsvp (public) pages.
 */
import { Component, Input, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonIcon } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  calendarOutline,
  locationOutline,
  timeOutline,
} from "ionicons/icons";

import { Event, InvitationTheme } from "@models/index";
import { formatDatePT, getDaysUntil } from "@utils/index";
import { getMonogram, getThemeColor, getTimeLabel } from "@utils/index";

@Component({
  selector: "app-invitation-card",
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: "./invitation-card.component.html",
  styleUrls: ["./invitation-card.component.scss"],
})
export class InvitationCardComponent {
  @Input({ required: true }) set event(value: Event | null | undefined) {
    this._event.set(value ?? null);
  }

  @Input() showEnvelope = true;
  @Input() showCountdown = true;
  @Input() showSchedule = true;
  @Input() compact = false;

  private _event = signal<Event | null>(null);

  // Computed values
  currentEvent = computed(() => this._event());
  themeColor = computed(() => {
    const evt = this.currentEvent();
    return evt ? getThemeColor(evt.theme) : "#8b5a5a";
  });
  monogram = computed(() => {
    const evt = this.currentEvent();
    return evt ? getMonogram(evt) : "♥";
  });
  timeLabel = computed(() => {
    const evt = this.currentEvent();
    return evt ? getTimeLabel(evt) : null;
  });
  daysUntil = computed(() => {
    const evt = this.currentEvent();
    return evt ? getDaysUntil(evt.date) : 0;
  });

  constructor() {
    addIcons({
      calendarOutline,
      locationOutline,
      timeOutline,
    });
  }

  getDisplayDate(dateStr?: string): string {
    return dateStr ? formatDatePT(dateStr) : "";
  }
}
