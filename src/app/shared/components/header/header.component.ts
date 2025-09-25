import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent {
  @Input() title = 'Rolo App';
  @Input() showBackButton = false;
  @Input() backUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  async logout() {
    try {
      await this.authService.logout();
      this.notificationService.success('Sesión cerrada correctamente');
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.notificationService.error('Error al cerrar sesión');
    }
  }

  navigateToProfile() {
    this.router.navigate(['/tabs/profile']);
  }

  navigateToHome() {
    this.router.navigate(['/tabs/feed']);
  }
}
