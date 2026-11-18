import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conference } from '../../../shared/models/conference';
import { ConferenceDetails } from './conference-details';

registerLocaleData(localeFr);

describe('ConferenceDetails', () => {
  let fixture: ComponentFixture<ConferenceDetails>;
  const conference: Conference = {
    id: 2,
    title: 'Signals Workshop',
    description: 'Atelier pratique sur les Signals Angular.',
    date: '2027-11-30',
    place: 'Ariana',
    maxParticipants: 30,
    nbParticipants: 24,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceDetails],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ConferenceDetails);
    await fixture.whenStable();
  });

  it('explains how to select an event before any selection', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Sélectionnez une conférence');
    expect(element.querySelector('button')).toBeNull();
  });

  it('renders the selected input, a French date, and updated availability', async () => {
    fixture.componentRef.setInput('conference', conference);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.details-content h3')?.textContent).toContain('SIGNALS WORKSHOP');
    expect(element.textContent).toContain('Atelier pratique sur les Signals Angular.');
    expect(element.textContent).toContain('30 novembre 2027');
    expect(element.textContent).toContain('Ariana');
    expect(element.querySelector('.remaining strong')?.textContent).toBe('6');
    expect(
      element.querySelector('button')?.classList.contains('registration-button--limited'),
    ).toBe(true);

    fixture.componentRef.setInput('conference', {
      ...conference,
      title: 'Web Conference',
      nbParticipants: 30,
    });
    await fixture.whenStable();
    expect(element.querySelector('.details-content h3')?.textContent).toContain('WEB CONFERENCE');
    expect(element.querySelector('.remaining strong')?.textContent).toBe('0');
    expect(element.querySelector('button')?.disabled).toBe(true);
  });

  it('emits the selected ID without mutating the input when registering', async () => {
    const event = Object.freeze({ ...conference });
    fixture.componentRef.setInput('conference', event);
    await fixture.whenStable();
    const emitted: number[] = [];
    fixture.componentInstance.register.subscribe((id) => emitted.push(id));
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitted).toEqual([2]);
    expect(event.nbParticipants).toBe(24);
  });

  it('does not emit without selection or when all places are taken', async () => {
    const emitted: number[] = [];
    fixture.componentInstance.register.subscribe((id) => emitted.push(id));
    fixture.componentInstance.registerForConference();
    fixture.componentRef.setInput('conference', { ...conference, nbParticipants: 30 });
    await fixture.whenStable();
    fixture.componentInstance.registerForConference();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.classList.contains('registration-button--full')).toBe(true);
    button?.click();
    expect(emitted).toEqual([]);
  });

  it('uses the available state at exactly ten remaining places', async () => {
    fixture.componentRef.setInput('conference', { ...conference, nbParticipants: 20 });
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(false);
    expect(button?.classList.contains('registration-button--available')).toBe(true);
  });
});
