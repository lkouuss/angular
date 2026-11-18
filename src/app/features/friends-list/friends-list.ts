import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../../shared/icon/icon';
import { Friend } from '../../shared/models/community';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [Icon],
  templateUrl: './friends-list.html',
  styleUrl: './friends-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsList {
  readonly friends = input<Friend[]>([]);
}
