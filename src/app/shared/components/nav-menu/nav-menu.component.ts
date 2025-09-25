import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IonIcon, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, logInOutline, personAddOutline, peopleOutline, compassOutline, locationOutline, logOutOutline, diamond } from 'ionicons/icons';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: true,
  imports: [ CommonModule, RouterLink,IonIcon, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar]
})
export class NavMenuComponent implements OnInit {
  isAuthenticated = false;
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

    addIcons({
      'chevron-forward': chevronForward,
      'log-in-outline': logInOutline,
      'person-add-outline': personAddOutline,
      'people-outline': peopleOutline,
      'compass-outline': compassOutline,
      'location-outline': locationOutline,
      'log-out-outline': logOutOutline,
      'diamond': diamond
    });

  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      (isAuth) => (this.isAuthenticated = isAuth)
    );
    
    this.authService.user$.subscribe(
      (user) => (this.user = user)
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/explore']);
  }
}