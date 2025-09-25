import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
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
  // Add any other icons you need
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppComponent {
  constructor() {
    // Register icons
    addIcons({
      'location-outline': locationOutline,
      'people-outline': peopleOutline,
      'compass-outline': compassOutline,
      'log-out-outline': logOutOutline,
      'person-outline': personOutline,
      'home-outline': homeOutline,
      'menu-outline': menuOutline,
      'add-outline': addOutline,
      'search-outline': searchOutline,
      'chevron-forward-outline': chevronForwardOutline,
      // Add any other icons you need
    });
  }
}
