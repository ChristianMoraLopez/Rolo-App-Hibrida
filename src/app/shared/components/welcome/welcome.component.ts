import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateToExplore() {
    this.router.navigate(['/tabs/explore']);
  }

  navigateToAddLocation() {
    this.router.navigate(['/tabs/add-location']);
  }
}
