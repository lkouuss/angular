import { Component, computed, signal } from '@angular/core';
import { ProfileUser } from '../../features/profile-user/profile-user';
import { FriendsList } from '../../features/friends-list/friends-list';
import { NotificationList } from '../../features/notification-list/notification-list';
import { ConferenceList } from '../../features/conferences/conference-list/conference-list';
import { Icon } from '../../shared/icon/icon';
import { AppNotification, Friend } from '../../shared/models/community';
import { Conference } from '../../shared/models/conference';

@Component({
  selector: 'app-home',
  imports: [ProfileUser, FriendsList, NotificationList, ConferenceList, Icon],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly profileName = signal('Koussay Laifi');
  readonly firstName = computed(() => this.profileName().trim().split(/\s+/)[0] || 'vous');
  readonly friends: Friend[] = [
    { id: 1, name: 'Sami Ben Ali', role: 'Développeur frontend', initials: 'SB', online: true },
    {
      id: 2,
      name: 'Youssef Mansour',
      role: 'Étudiant en informatique',
      initials: 'YM',
      online: true,
    },
    { id: 3, name: 'Amine Trabelsi', role: 'Passionné de cloud', initials: 'AT', online: false },
  ];
  readonly notifications = signal<AppNotification[]>([
    {
      id: 1,
      title: 'Bienvenue sur Conference App',
      message: 'Votre espace est prêt. Découvrez les prochaines conférences.',
      time: 'À l’instant',
      kind: 'conference',
      read: false,
    },
    {
      id: 2,
      title: 'Une invitation vous attend',
      message: 'Sami vous invite à échanger avec la communauté.',
      time: 'Il y a 15 min',
      kind: 'invitation',
      read: false,
    },
  ]);

  private nextNotificationId = 3;

  onRegistration(conference: Conference): void {
    const notification: AppNotification = {
      id: this.nextNotificationId++,
      title: 'Inscription ajoutée',
      message: `${conference.title} · ${conference.place}. ${conference.maxParticipants - conference.nbParticipants} place(s) restante(s).`,
      time: 'À l’instant',
      kind: 'registration',
      read: false,
    };
    this.notifications.update((items) => [notification, ...items]);
  }

  markNotificationsRead(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }
}
