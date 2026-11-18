import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { Home } from './core/home/home';
import { Footer } from './core/footer/footer';

@Component({
  imports: [RouterOutlet, Header,Home,Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('DAS13');
}
