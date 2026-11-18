import { Component, input } from '@angular/core';

export type IconName =
  | 'calendar'
  | 'location'
  | 'arrow-right'
  | 'arrow-left'
  | 'search'
  | 'users'
  | 'user'
  | 'bell'
  | 'check'
  | 'close'
  | 'chevron-down'
  | 'mail'
  | 'edit'
  | 'book'
  | 'code'
  | 'sparkles'
  | 'plus'
  | 'external'
  | 'info';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2M8 18h2" />
        }
        @case ('location') {
          <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        }
        @case ('arrow-right') {
          <path d="M4 12h16m-6-6 6 6-6 6" />
        }
        @case ('arrow-left') {
          <path d="M20 12H4m6-6-6 6 6 6" />
        }
        @case ('search') {
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        }
        @case ('users') {
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          />
          <circle cx="9" cy="7" r="4" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        }
        @case ('check') {
          <path d="m5 12 4 4L19 6" />
        }
        @case ('close') {
          <path d="m6 6 12 12M6 18 18 6" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m3 7 9 6 9-6" />
        }
        @case ('edit') {
          <path d="m15 5 4 4M4 20l4-1L20 7a2.83 2.83 0 0 0-4-4L4 15l-1 6 6-1" />
        }
        @case ('book') {
          <path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z" />
        }
        @case ('code') {
          <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />
        }
        @case ('sparkles') {
          <path
            d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4M3 18v4m-2-2h4"
          />
        }
        @case ('plus') {
          <path d="M12 4v16M4 12h16" />
        }
        @case ('external') {
          <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6m0-10h.01" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
      vertical-align: middle;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}
