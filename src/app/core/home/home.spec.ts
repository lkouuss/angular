import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, type Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConferenceList } from '../../features/conferences/conference-list/conference-list';
import { NotificationList } from '../../features/notification-list/notification-list';
import { ProfileUser } from '../../features/profile-user/profile-user';
import { Conference } from '../../shared/models/conference';
import { Home } from './home';

registerLocaleData(localeFr);

describe('Home component communication', () => {
  let fixture: ComponentFixture<Home>;
  const event: Conference = {
    id: 99,
    title: 'Atelier de test',
    description: 'Une conférence de test pour vérifier la communication.',
    date: '2099-11-30',
    place: 'Ariana',
    maxParticipants: 30,
    nbParticipants: 20,
  };
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const child = <T>(componentType: Type<T>): T =>
    fixture.debugElement.query(By.directive(componentType)).componentInstance as T;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    }).compileComponents();
    fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    child(ConferenceList).conferences.set([{ ...event }]);
    await fixture.whenStable();
  });

  it('turns an actual conference registration into a new unread notification through the parent', async () => {
    const notifications = child(NotificationList);
    const beforeCount = notifications.notifications().length;
    const beforeUnread = notifications.unreadCount();
    const registerButton = Array.from(
      element().querySelectorAll<HTMLButtonElement>('app-conference-list button'),
    ).find((button) => button.getAttribute('aria-label') === 'S’inscrire à Atelier de test');
    expect(registerButton).toBeDefined();
    registerButton?.click();
    await fixture.whenStable();

    expect(child(ConferenceList).conferences()[0].nbParticipants).toBe(21);
    expect(notifications.notifications()).toHaveLength(beforeCount + 1);
    expect(notifications.unreadCount()).toBe(beforeUnread + 1);
    expect(notifications.notifications()[0].read).toBe(false);
    expect(element().querySelector('app-notification-list .notification')?.textContent).toContain(
      'Atelier de test',
    );
    expect(
      element().querySelector('app-notification-list .notification-count')?.textContent?.trim(),
    ).toBe(String(beforeUnread + 1));
  });

  it('marks notifications as read through the child output and updates the visible summary', async () => {
    const notifications = child(NotificationList);
    const readAllButton = element().querySelector<HTMLButtonElement>(
      'app-notification-list .read-all',
    );
    expect(notifications.unreadCount()).toBeGreaterThan(0);
    expect(readAllButton).not.toBeNull();
    readAllButton?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.notifications().every((item) => item.read)).toBe(true);
    expect(notifications.unreadCount()).toBe(0);
    expect(element().querySelector('app-notification-list .notification-count')).toBeNull();
    expect(
      element().querySelector('app-notification-list .notification-summary')?.textContent,
    ).toContain('Vous êtes à jour.');
    expect(readAllButton?.disabled).toBe(true);
  });

  it('saves the profile name from a form and propagates the model change back to Home', async () => {
    const editButton = element().querySelector<HTMLButtonElement>(
      'app-profile-user button[aria-label="Modifier mon nom"]',
    );
    expect(editButton).not.toBeNull();
    editButton?.click();
    await fixture.whenStable();
    const nameInput = element().querySelector<HTMLInputElement>('#profile-name');
    if (!nameInput) throw new Error('Champ du nom de profil introuvable');
    nameInput.value = '  Koussay  Angular  ';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    const profileForm = element().querySelector<HTMLFormElement>('app-profile-user form');
    profileForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.profileName()).toBe('Koussay Angular');
    expect(child(ProfileUser).name()).toBe('Koussay Angular');
    expect(element().querySelector('app-profile-user .profile-person h3')?.textContent).toBe(
      'Koussay Angular',
    );
  });
});
