import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-envelope-seal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./envelope-seal.component.html",
  styleUrls: ["./envelope-seal.component.scss"],
})
export class EnvelopeSealComponent {
  @Input() variant: string = "floral";
  @Input() ariaLabel: string = "Abrir convite";
  @Input() spinning = false;
  @Input() opened = false;
  @Input() color?: string;

  @Output() sealClick = new EventEmitter<void>();

  handleClick(): void {
    if (this.spinning || this.opened) return;
    this.sealClick.emit();
  }
}
