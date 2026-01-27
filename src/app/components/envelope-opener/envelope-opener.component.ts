/**
 * EnvelopeOpenerComponent
 *
 * Fullscreen envelope animation that opens on seal click.
 * Used as an opening experience for invitation preview and RSVP pages.
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

  // Animation phase: closed -> opening -> expanding -> completed
  phase = signal<'closed' | 'opening' | 'expanding' | 'completed'>('closed');

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
    if (this.phase() !== 'closed') return;
    
    // FASE 1: Opening - aba sobe, carta começa a sair
    this.phase.set('opening');
    
    // FASE 2: Expanding - revela mais altura (após 1000ms)
    setTimeout(() => {
      this.phase.set('expanding');
    }, 1000);
    
    // FASE 3: Completed - conclui animação e emite evento (após 2600ms)
    setTimeout(() => {
      this.phase.set('completed');
      this.opened.emit();
    }, 2600);
  }

  advancePhase(): void {
    const current = this.phase();
    if (current === 'closed') {
      this.phase.set('opening');
      return;
    }
    if (current === 'opening') {
      this.phase.set('expanding');
      return;
    }
    if (current === 'expanding') {
      this.phase.set('completed');
      this.opened.emit();
      return;
    }
    this.phase.set('closed');
  }
}
