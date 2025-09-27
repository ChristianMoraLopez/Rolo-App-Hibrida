// src/app/app.component.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  locationOutline,
  peopleOutline,
  compassOutline,
  logOutOutline,
  personOutline,
  homeOutline,
  menuOutline,
  addOutline,
  searchOutline,
  chevronForwardOutline,
  cartOutline,
  mapOutline,
  logInOutline,
  personAddOutline,
  diamond,
  people
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterOutlet],
})
export class AppComponent {
  constructor() {
    // ✅ Solo registrar TODOS los iconos aquí una vez para toda la app
    addIcons({
      'location-outline': locationOutline,
      'people-outline': peopleOutline,
      'people': people,
      'compass-outline': compassOutline,
      'log-out-outline': logOutOutline,
      'log-in-outline': logInOutline,
      'person-outline': personOutline,
      'person-add-outline': personAddOutline,
      'home-outline': homeOutline,
      'menu-outline': menuOutline,
      'add-outline': addOutline,
      'search-outline': searchOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'chevron-forward': chevronForwardOutline,
      'cart-outline': cartOutline,
      'map-outline': mapOutline,
      'diamond': diamond,
    });
  }
}