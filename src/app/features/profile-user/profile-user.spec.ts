import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileUser } from './profile-user';

@Component({
  standalone: true,
  imports: [ProfileUser],
  template: `
    <app-profile-user [(name)]="name" [email]="email" (nameChange)="savedNames.push($event)" />
  `,
})
class ProfileHost {
  readonly name = signal('Koussay Laifi');
  readonly email = 'koussay@example.test';
  readonly savedNames: string[] = [];
}

describe('ProfileUser editing', () => {
  let fixture: ComponentFixture<ProfileHost>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProfileHost] }).compileComponents();
    fixture = TestBed.createComponent(ProfileHost);
    element = fixture.nativeElement as HTMLElement;
    await render();
  });

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function button(text: string): HTMLButtonElement {
    const found = Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.trim() === text,
    );
    if (!found) throw new Error(`Button not found: ${text}`);
    return found;
  }

  async function editName(value: string): Promise<void> {
    if (!element.querySelector('form')) {
      element.querySelector<HTMLButtonElement>('button[aria-label="Modifier mon nom"]')!.click();
      await render();
    }
    const field = element.querySelector<HTMLInputElement>('#profile-name')!;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await render();
  }

  async function submit(): Promise<void> {
    // A real form submit exercises ngSubmit and the model's implicit nameChange output.
    element
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await render();
  }

  it('normalizes the submitted name and sends nameChange back to its parent', async () => {
    await editName('   Koussay   Ben   Laifi   ');
    await submit();

    expect(fixture.componentInstance.name()).toBe('Koussay Ben Laifi');
    expect(fixture.componentInstance.savedNames).toEqual(['Koussay Ben Laifi']);
    expect(element.querySelector('h3')?.textContent).toBe('Koussay Ben Laifi');
    expect(element.querySelector('form')).toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Profil mis à jour.');
  });

  it('rejects blank, one-character, and over-60-character names without changing the parent', async () => {
    for (const invalidName of ['   ', ' A ', 'A'.repeat(61)]) {
      await editName(invalidName);
      await submit();

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'entre 2 et 60 caractères',
      );
      expect(element.querySelector('#profile-name')?.getAttribute('aria-invalid')).toBe('true');
      expect(element.querySelector('form')).not.toBeNull();
      expect(fixture.componentInstance.name()).toBe('Koussay Laifi');
      expect(fixture.componentInstance.savedNames).toEqual([]);
    }
  });

  it('accepts the inclusive boundaries of two and sixty characters', async () => {
    const minimumName = 'Al';
    const maximumName = 'A'.repeat(60);

    await editName(minimumName);
    await submit();
    expect(fixture.componentInstance.name()).toBe(minimumName);

    await editName(maximumName);
    await submit();
    expect(fixture.componentInstance.name()).toBe(maximumName);
    expect(fixture.componentInstance.savedNames).toEqual([minimumName, maximumName]);
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('discards a cancelled draft and reopens with the unchanged saved name', async () => {
    await editName('Un autre nom');
    button('Annuler').click();
    await render();

    expect(fixture.componentInstance.name()).toBe('Koussay Laifi');
    expect(fixture.componentInstance.savedNames).toEqual([]);
    expect(element.querySelector('form')).toBeNull();

    element.querySelector<HTMLButtonElement>('button[aria-label="Modifier mon nom"]')!.click();
    await render();
    expect(element.querySelector<HTMLInputElement>('#profile-name')?.value).toBe('Koussay Laifi');
  });
});
