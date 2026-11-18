import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Conference } from '../../../shared/models/conference';
import { Icon } from '../../../shared/icon/icon';
import { ConferenceDetails } from '../conference-details/conference-details';

function normalizeTitle(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr');
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-conference-list',
  imports: [DatePipe, UpperCasePipe, FormsModule, Icon, ConferenceDetails],
  templateUrl: './conference-list.html',
  styleUrl: './conference-list.css',
})
export class ConferenceList {
  private readonly currentDay = signal(today());
  // Une seule source de vérité : la liste possède les conférences (Prosit 1).
  readonly conferences = signal<Conference[]>([
    {
      id: 1,
      title: 'Angular 21 Conference',
      description:
        'Une journée pour explorer les composants standalone, le data-binding et les bonnes pratiques Angular avec la communauté.',
      date: '2027-11-15',
      place: 'Tunis',
      maxParticipants: 50,
      nbParticipants: 25,
    },
    {
      id: 2,
      title: 'Signals Workshop',
      description:
        'Un atelier pratique pour comprendre les Signals Angular et construire des composants qui communiquent simplement.',
      date: '2027-11-30',
      place: 'Ariana',
      maxParticipants: 30,
      nbParticipants: 24,
    },
    {
      id: 3,
      title: 'Web Conference',
      description:
        'Un rendez-vous autour des interfaces accessibles, du développement web et des expériences numériques de demain.',
      date: '2027-11-20',
      place: 'Sousse',
      maxParticipants: 100,
      nbParticipants: 100,
    },
  ]);
  readonly searchTerm = signal('');
  readonly availableOnly = signal(false);
  readonly selectedId = signal<number | null>(null);
  readonly lastRegistration = signal('');
  readonly registrationAdded = output<Conference>();

  // computed() dérive une valeur des Signals : aucun deuxième état à synchroniser.
  readonly upcomingConferences = computed(() =>
    this.conferences().filter((item) => item.date >= this.currentDay()),
  );
  readonly visibleConferences = computed(() => {
    const query = normalizeTitle(this.searchTerm());
    return this.upcomingConferences().filter(
      (item) =>
        normalizeTitle(item.title).includes(query) &&
        (!this.availableOnly() || this.remainingPlaces(item) > 0),
    );
  });
  readonly selectedConference = computed(
    () => this.conferences().find((item) => item.id === this.selectedId()) ?? null,
  );
  readonly remainingTotal = computed(() =>
    this.upcomingConferences().reduce((total, item) => total + this.remainingPlaces(item), 0),
  );

  constructor() {
    let dayTimer: ReturnType<typeof setTimeout>;
    const scheduleNextDay = (): void => {
      const nextDay = new Date();
      nextDay.setHours(24, 0, 0, 0);
      dayTimer = setTimeout(() => {
        this.currentDay.set(today());
        scheduleNextDay();
      }, nextDay.getTime() - Date.now());
    };
    scheduleNextDay();
    // Un onglet ouvert après minuit doit aussi retirer les événements passés.
    inject(DestroyRef).onDestroy(() => clearTimeout(dayTimer));
  }

  remainingPlaces(conference: Conference): number {
    return Math.max(0, conference.maxParticipants - conference.nbParticipants);
  }

  selectConference(id: number): void {
    if (this.conferences().some((item) => item.id === id)) this.selectedId.set(id);
  }

  registerForConference(id: number): void {
    const conference = this.conferences().find((item) => item.id === id);
    if (!conference || this.remainingPlaces(conference) === 0 || conference.date < today()) return;

    // Un nouvel objet actualise à la fois la carte et l’input du composant enfant.
    const updated = { ...conference, nbParticipants: conference.nbParticipants + 1 };
    this.conferences.update((items) => items.map((item) => (item.id === id ? updated : item)));
    this.selectedId.set(id);
    this.lastRegistration.set(
      `Inscription ajoutée pour ${updated.title}. Il reste ${this.remainingPlaces(updated)} place(s).`,
    );
    this.registrationAdded.emit(updated);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.availableOnly.set(false);
  }
}
