import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the conference dashboard and its independent sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Conference App');
    for (const selector of [
      'app-header',
      'app-navbar',
      'app-profile-user',
      'app-friends-list',
      'app-notification-list',
      'app-conference-list',
      'app-conference-details',
      'app-footer',
    ]) {
      expect(compiled.querySelector(selector)).not.toBeNull();
    }
  });
});
