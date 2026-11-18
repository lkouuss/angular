export interface Friend {
  id: number;
  name: string;
  role: string;
  initials: string;
  online: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  kind: 'conference' | 'invitation' | 'registration';
  read: boolean;
}
