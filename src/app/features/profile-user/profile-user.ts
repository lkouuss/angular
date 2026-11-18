import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './profile-user.html',
  styleUrl: './profile-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUser {
  private readonly injector = inject(Injector);
  private readonly nameField = viewChild<ElementRef<HTMLInputElement>>('nameField');
  private readonly editButton = viewChild<ElementRef<HTMLButtonElement>>('editButton');
  // model() transmet aussi le nouveau nom au parent après la sauvegarde.
  readonly name = model<string>('Koussay Laifi');
  readonly email = input('etudiant@exemple.fr');
  readonly editing = signal(false);
  readonly draftName = signal('');
  readonly error = signal('');
  readonly saved = signal(false);
  readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );

  startEdit(): void {
    this.draftName.set(this.name());
    this.error.set('');
    this.saved.set(false);
    this.editing.set(true);
    afterNextRender(() => this.nameField()?.nativeElement.focus(), { injector: this.injector });
  }

  saveName(): void {
    const nextName = this.draftName().trim().replace(/\s+/g, ' ');
    if (nextName.length < 2 || nextName.length > 60) {
      this.error.set('Saisissez un nom entre 2 et 60 caractères.');
      return;
    }

    this.name.set(nextName);
    this.editing.set(false);
    this.error.set('');
    this.saved.set(true);
    this.restoreEditFocus();
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.error.set('');
    this.restoreEditFocus();
  }

  private restoreEditFocus(): void {
    // Les contrôles sont recréés par @if : attendre leur rendu avant le focus.
    afterNextRender(() => this.editButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
