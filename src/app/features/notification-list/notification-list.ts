import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../shared/icon/icon';
import { AppNotification } from '../../shared/models/community';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [Icon],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationList {
  readonly notifications = input<AppNotification[]>([]);
  // Le parent reste propriétaire des notifications et de leur état de lecture.
  readonly readAll = output<void>();
  readonly expanded = signal(true);
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly notificationIcons = {
    conference: 'calendar',
    invitation: 'users',
    registration: 'check',
  } as const;

  toggleList(): void {
    this.expanded.update((isExpanded) => !isExpanded);
  }
}
