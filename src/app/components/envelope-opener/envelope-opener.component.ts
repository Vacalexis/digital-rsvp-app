/**
 * EnvelopeOpenerComponent
 *
 * Simple envelope animation that opens on seal click.
 * Adapted from CodePen: https://codepen.io/Coding-Star/pen/WNpbvwB
 * With floral seal that rotates before opening.
 */
import { Component, Input, Output, EventEmitter, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Event } from "@models/index";
import { getMonogram, getThemeColor, formatDatePT } from "@utils/index";

@Component({
  selector: "app-envelope-opener",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./envelope-opener.component.html",
  styleUrls: ["./envelope-opener.component.scss"],
})
export class EnvelopeOpenerComponent {
  @Input({ required: true }) set event(value: Event | null | undefined) {
    this._event.set(value ?? null);
  }
  
  @Output() opened = new EventEmitter<void>();

  private _event = signal<Event | null>(null);

  // Simple state: spinning -> opened (peek) -> revealing -> envelopeDown -> envelopeHidden -> fullScreen
  isSpinning = signal(false);
  isOpened = signal(false);
  isRevealing = signal(false);
  isEnvelopeDown = signal(false);
  isEnvelopeHidden = signal(false);
  isFullScreen = signal(false);

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

  getDisplayDate(dateStr?: string): string {
    return dateStr ? formatDatePT(dateStr) : "";
  }

  openEnvelope(): void {
    if (this.isOpened() || this.isSpinning()) return;
    
    // Step 1: Spin the seal
    this.isSpinning.set(true);
    
    // Step 2: Open envelope, letter peeks out
    setTimeout(() => {
      this.isOpened.set(true);
    }, 600);
    
    // Step 3: Letter rises more, revealing full content
    setTimeout(() => {
      this.isRevealing.set(true);
    }, 1200);
    
    // Step 4: Envelope slides down, letter stays in place
    setTimeout(() => {
      this.isEnvelopeDown.set(true);
    }, 1800);
    
    // Step 5: Emit opened event
    setTimeout(() => {
      this.opened.emit();
    }, 2400);
  }

  expandLetter(): void {
    // Only expand if envelope is already down and not already expanding
    if (!this.isEnvelopeDown() || this.isEnvelopeHidden()) return;
    
    // Step 1: Envelope exits screen, letter compensates
    this.isEnvelopeHidden.set(true);
    
    // Step 2: After envelope is gone, letter expands to full screen
    setTimeout(() => {
      this.isFullScreen.set(true);
    }, 600);
  }
}
