import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { Conference } from '../../../shared/models/conference';

@Component({
  selector: 'app-conference-details',
  imports: [DatePipe, UpperCasePipe, Icon],
  templateUrl: './conference-details.html',
  styleUrl: './conference-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConferenceDetails {
  readonly conference = input<Conference | null>(null);
  readonly register = output<number>();

  // La disponibilité est dérivée de l'input et se recalcule après une inscription.
  readonly remaining = computed(() => {
    const selected = this.conference();
    return selected ? Math.max(0, selected.maxParticipants - selected.nbParticipants) : 0;
  });

  readonly availability = computed(() => {
    if (this.remaining() === 0) return 'full';
    return this.remaining() < 10 ? 'limited' : 'available';
  });

  registerForConference(): void {
    const selected = this.conference();

    // L'enfant demande l'inscription. Le parent reste propriétaire des données.
    if (selected && this.remaining() > 0) {
      this.register.emit(selected.id);
    }
  }
}
