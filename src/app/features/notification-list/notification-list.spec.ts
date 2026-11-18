import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppNotification } from '../../shared/models/community';
import { NotificationList } from './notification-list';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: 'Nouvelle conférence',
    message: 'La conférence Angular est disponible.',
    time: 'Il y a 5 min',
    kind: 'conference',
    read: false,
  },
  {
    id: 2,
    title: 'Invitation de Sami',
    message: 'Sami vous a envoyé une invitation.',
    time: 'Il y a 10 min',
    kind: 'invitation',
    read: false,
  },
];

@Component({
  standalone: true,
  imports: [NotificationList],
  template: ` <app-notification-list [notifications]="notifications()" (readAll)="onReadAll()" /> `,
})
class NotificationHost {
  readonly notifications = signal<AppNotification[]>(
    INITIAL_NOTIFICATIONS.map((item) => ({ ...item })),
  );
  readRequests = 0;

  onReadAll(): void {
    this.readRequests += 1;
  }
}

describe('NotificationList interaction', () => {
  let fixture: ComponentFixture<NotificationHost>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NotificationHost] }).compileComponents();
    fixture = TestBed.createComponent(NotificationHost);
    element = fixture.nativeElement as HTMLElement;
    await render();
  });

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function disclosureButton(): HTMLButtonElement {
    return element.querySelector<HTMLButtonElement>('button[aria-controls="notification-items"]')!;
  }

  function markAllButton(): HTMLButtonElement | undefined {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Tout marquer comme lu'),
    );
  }

  it('starts expanded and displays incoming notifications with the unread count', () => {
    expect(disclosureButton().getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelectorAll('#notification-items li').length).toBe(2);
    expect(element.textContent).toContain('La conférence Angular est disponible.');
    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      '2 nouvelles notifications',
    );
    expect(markAllButton()?.disabled).toBe(false);
  });

  it('hides and restores the list through its accessible disclosure button', async () => {
    disclosureButton().click();
    await render();

    expect(disclosureButton().getAttribute('aria-expanded')).toBe('false');
    expect(disclosureButton().getAttribute('aria-label')).toBe('Afficher les notifications');
    expect(element.querySelector('#notification-items')).not.toBeNull();
    expect(element.querySelector('#notification-items ul')).toBeNull();
    expect(element.textContent).not.toContain('La conférence Angular est disponible.');

    disclosureButton().click();
    await render();
    expect(disclosureButton().getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelectorAll('#notification-items li').length).toBe(2);
  });

  it('emits readAll, then reflects the read state supplied by its parent', async () => {
    markAllButton()!.click();
    await render();

    expect(fixture.componentInstance.readRequests).toBe(1);
    expect(fixture.componentInstance.notifications().every((item) => !item.read)).toBe(true);

    fixture.componentInstance.notifications.update((items) =>
      items.map((item) => ({ ...item, read: true })),
    );
    await render();

    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Vous êtes à jour.',
    );
    expect(element.querySelector('[aria-label="2 non lues"]')).toBeNull();
    expect(markAllButton()?.disabled).toBe(true);
    markAllButton()!.click();
    expect(fixture.componentInstance.readRequests).toBe(1);
  });

  it('provides an empty state without a redundant mark-all action', async () => {
    fixture.componentInstance.notifications.set([]);
    await render();

    expect(element.textContent).toContain('Aucune notification pour le moment.');
    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Vous êtes à jour.',
    );
    expect(markAllButton()).toBeUndefined();
    expect(element.querySelector('[aria-label$="non lues"]')).toBeNull();
  });
});
