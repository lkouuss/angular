import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Conference } from '../../../shared/models/conference';
import { ConferenceDetails } from '../conference-details/conference-details';
import { ConferenceList } from './conference-list';

registerLocaleData(localeFr);

describe('ConferenceList', () => {
  let fixture: ComponentFixture<ConferenceList>;
  let component: ConferenceList;

  const makeConference = (id: number, changes: Partial<Conference> = {}): Conference => ({
    id,
    title: `Conférence ${id}`,
    description: 'Une rencontre pour apprendre ensemble.',
    date: '2099-11-15',
    place: 'Tunis',
    maxParticipants: 30,
    nbParticipants: 5,
    ...changes,
  });

  const events = (): Conference[] => [
    makeConference(1, { title: 'Conférence Angular 21' }),
    makeConference(2, { title: 'Signals Workshop', place: 'Ariana', nbParticipants: 24 }),
    makeConference(3, { title: 'Web Conference', place: 'Sousse', nbParticipants: 30 }),
  ];

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const detailButtons = (): HTMLButtonElement[] =>
    Array.from(element().querySelectorAll<HTMLButtonElement>('button')).filter((button) =>
      button.getAttribute('aria-label')?.startsWith('Afficher les détails de '),
    );
  const buttonNamed = (name: string): HTMLButtonElement => {
    const button = Array.from(element().querySelectorAll<HTMLButtonElement>('button')).find(
      (item) => item.getAttribute('aria-label') === name,
    );
    if (!button) throw new Error(`Bouton introuvable : ${name}`);
    return button;
  };

  const enterSearch = async (query: string): Promise<void> => {
    const search = element().querySelector<HTMLInputElement>('#conference-search');
    if (!search) throw new Error('Champ de recherche introuvable');
    search.value = query;
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceList],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ConferenceList);
    component = fixture.componentInstance;
    component.conferences.set(events());
    await fixture.whenStable();
  });

  it('removes past events at local midnight even when the page stays open', () => {
    fixture.destroy();
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2099, 10, 15, 23, 59, 59));
      fixture = TestBed.createComponent(ConferenceList);
      component = fixture.componentInstance;
      component.conferences.set([makeConference(1, { date: '2099-11-15' })]);
      expect(component.upcomingConferences()).toHaveLength(1);
      vi.advanceTimersByTime(1000);
      expect(component.upcomingConferences()).toHaveLength(0);
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows only upcoming events, including full events until availability is filtered', async () => {
    component.conferences.update((items) => [
      ...items,
      makeConference(4, { title: 'Ancienne conférence', date: '2000-01-01' }),
    ]);
    await fixture.whenStable();
    const labels = detailButtons().map((button) => button.getAttribute('aria-label'));
    expect(labels).toHaveLength(3);
    expect(labels).toContain('Afficher les détails de Web Conference');
    expect(labels).not.toContain('Afficher les détails de Ancienne conférence');
  });

  it('filters partial and complete titles from real ngModel input events, ignoring case and accents', async () => {
    await enterSearch('conference ANGULAR');
    expect(component.searchTerm()).toBe('conference ANGULAR');
    expect(detailButtons()).toHaveLength(1);
    expect(detailButtons()[0].getAttribute('aria-label')).toBe(
      'Afficher les détails de Conférence Angular 21',
    );

    await enterSearch('CONFÉRENCE ANGULAR 21');
    expect(detailButtons()).toHaveLength(1);
    await enterSearch('signals');
    expect(detailButtons()[0].getAttribute('aria-label')).toBe(
      'Afficher les détails de Signals Workshop',
    );
  });

  it('combines the title search with the available-only filter and restores both filters', async () => {
    element().querySelector<HTMLInputElement>('#conference-list input[type="checkbox"]')?.click();
    await fixture.whenStable();
    expect(component.availableOnly()).toBe(true);
    expect(detailButtons()).toHaveLength(2);
    await enterSearch('web');
    expect(detailButtons()).toHaveLength(0);
    element().querySelector<HTMLButtonElement>('.empty-results button')?.click();
    await fixture.whenStable();
    expect(component.availableOnly()).toBe(false);
    expect(element().querySelector<HTMLInputElement>('#conference-search')?.value).toBe('');
    expect(detailButtons()).toHaveLength(3);
  });

  it('distinguishes an empty conference collection from a search with no matching result', async () => {
    await enterSearch('introuvable');
    expect(detailButtons()).toHaveLength(0);
    const noResultMessage = element().textContent ?? '';
    expect(noResultMessage).toMatch(/Aucun résultat|Aucune conférence ne correspond/i);

    component.clearFilters();
    component.conferences.set([]);
    await fixture.whenStable();
    expect(detailButtons()).toHaveLength(0);
    expect(element().textContent).toMatch(
      /Aucune conférence à venir|Aucune conférence enregistrée/i,
    );
    expect(element().textContent).not.toBe(noResultMessage);
  });

  it('passes the chosen event to the nested detail component when its details button is clicked', async () => {
    buttonNamed('Afficher les détails de Signals Workshop').click();
    await fixture.whenStable();
    const details = fixture.debugElement.query(By.directive(ConferenceDetails))
      .componentInstance as ConferenceDetails;
    expect(details.conference()?.id).toBe(2);
    expect(
      element().querySelector('app-conference-details .details-content h3')?.textContent,
    ).toContain('SIGNALS WORKSHOP');

    buttonNamed('Afficher les détails de Conférence Angular 21').click();
    await fixture.whenStable();
    expect(details.conference()?.id).toBe(1);
  });

  it('registers through the list and detail while keeping the selected data synchronized immutably', async () => {
    const previousList = component.conferences();
    const previousEvent = previousList[1];
    const emitted: Conference[] = [];
    component.registrationAdded.subscribe((event) => emitted.push(event));
    buttonNamed('S’inscrire à Signals Workshop').click();
    await fixture.whenStable();

    const detailsDebug = fixture.debugElement.query(By.directive(ConferenceDetails));
    const details = detailsDebug.componentInstance as ConferenceDetails;
    expect(details.conference()?.nbParticipants).toBe(25);
    expect(details.remaining()).toBe(5);
    expect(component.conferences()).not.toBe(previousList);
    expect(previousEvent.nbParticipants).toBe(24);
    expect(component.conferences().find((event) => event.id === 2)).not.toBe(previousEvent);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe(2);

    (detailsDebug.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    await fixture.whenStable();
    expect(component.conferences().find((event) => event.id === 2)?.nbParticipants).toBe(26);
    expect(details.conference()?.nbParticipants).toBe(26);
    expect(details.remaining()).toBe(4);
    expect(emitted).toHaveLength(2);
    expect(component.lastRegistration()).toContain('Signals Workshop');
  });

  it('changes availability at ten, nine, one and zero remaining places without allowing overbooking', async () => {
    component.conferences.set([
      makeConference(1, { title: 'Test capacité', maxParticipants: 10, nbParticipants: 0 }),
    ]);
    await fixture.whenStable();
    const button = buttonNamed('S’inscrire à Test capacité');
    expect(component.remainingPlaces(component.conferences()[0])).toBe(10);
    expect(button.classList.contains('button-success')).toBe(true);
    button.click();
    await fixture.whenStable();
    expect(button.classList.contains('button-warning')).toBe(true);
    expect(component.remainingPlaces(component.conferences()[0])).toBe(9);

    for (let index = 0; index < 8; index++) component.registerForConference(1);
    await fixture.whenStable();
    expect(component.remainingPlaces(component.conferences()[0])).toBe(1);
    button.click();
    await fixture.whenStable();
    expect(component.conferences()[0].nbParticipants).toBe(10);
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('button-danger')).toBe(true);
    button.click();
    component.registerForConference(1);
    expect(component.conferences()[0].nbParticipants).toBe(10);
  });

  it('ignores unknown, past and already full event IDs without emitting a registration', async () => {
    component.conferences.update((items) => [...items, makeConference(4, { date: '2000-01-01' })]);
    await fixture.whenStable();
    const before = component.conferences().map((event) => ({ ...event }));
    const emitted: Conference[] = [];
    component.registrationAdded.subscribe((event) => emitted.push(event));
    component.registerForConference(999);
    component.registerForConference(3);
    component.registerForConference(4);
    expect(component.conferences()).toEqual(before);
    expect(emitted).toEqual([]);
  });
});
