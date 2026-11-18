import { Component } from '@angular/core';
import { Header } from './core/header/header';
import { Navbar } from './core/navbar/navbar';
import { Home } from './core/home/home';
import { Footer } from './core/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar, Home, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
