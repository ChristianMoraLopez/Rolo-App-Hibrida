import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IonIcon, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, logInOutline, personAddOutline, peopleOutline, compassOutline, locationOutline, logOutOutline, diamond, people } from 'ionicons/icons';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: true, 
  imports: [CommonModule, RouterLink, IonIcon, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar]
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
      'people': people,
      'compass-outline': compassOutline,
      'location-outline': locationOutline,
      'log-out-outline': logOutOutline,
      'diamond': diamond
    });
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        console.log('🔐 Auth status:', isAuth);
      }
    );
    
    this.authService.user$.subscribe(
      (user) => {
        this.user = user;
        console.log('👤 User data:', user);
        console.log('🖼️ Avatar URL:', user?.avatar);
      }
    );
  }

  // Método getter para obtener la URL del avatar
  getAvatarUrl(): string {
    const avatarUrl = this.user?.avatar;
    
    // Si no hay avatar, generar uno con las iniciales del usuario
    let fallbackUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    
    // Si tenemos el nombre del usuario, generar avatar con iniciales
    if (this.user?.name && !avatarUrl) {
      const name = encodeURIComponent(this.user.name);
      fallbackUrl = `https://ui-avatars.com/api/?name=${name}&background=667eea&color=ffffff&size=200&font-size=0.6`;
    }
    
    console.log('🎨 Getting avatar URL:', avatarUrl || fallbackUrl);
    
    // Si no hay avatar o es una cadena vacía, usar fallback
    if (!avatarUrl || avatarUrl.trim() === '') {
      return fallbackUrl;
    }
    
    return avatarUrl;
  }

  // Manejar error de carga de imagen
  onImageError(event: any) {
    console.error('❌ Error loading image:', event.target.src);
    
    // Si falla y tenemos nombre, usar avatar con iniciales
    if (this.user?.name) {
      const name = encodeURIComponent(this.user.name);
      event.target.src = `https://ui-avatars.com/api/?name=${name}&background=667eea&color=ffffff&size=200&font-size=0.6`;
    } else {
      // Si no hay nombre, usar avatar genérico
      event.target.src = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }

  // Confirmar carga exitosa de imagen
  onImageLoad(event: any) {
    console.log('✅ Image loaded successfully:', event.target.src);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/explore']);
  }
}