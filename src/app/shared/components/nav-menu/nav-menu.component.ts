// src/app/shared/components/nav-menu/nav-menu.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: true, 
  imports: [CommonModule, RouterLink, IonicModule]
})
export class NavMenuComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  user: any = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación
    const authSub = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        console.log('🔐 Auth status:', isAuth);
      }
    );
    
    // Suscribirse a los datos del usuario
    const userSub = this.authService.user$.subscribe(
      (user) => {
        this.user = user;
        console.log('👤 User data:', user);
        console.log('🖼️ Avatar URL:', user?.avatar);
      }
    );

    this.subscriptions.push(authSub, userSub);
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método getter para obtener la URL del avatar
  getAvatarUrl(): string {
    const avatarUrl = this.user?.avatar;
    
    console.log('🎨 Getting avatar URL - Raw:', avatarUrl);
    
    // Si no hay avatar o es una cadena vacía, generar fallback
    if (!avatarUrl || avatarUrl.trim() === '') {
      const fallbackUrl = this.generateFallbackAvatar();
      console.log('🎨 Using fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
    
    console.log('🎨 Using provided avatar URL:', avatarUrl);
    return avatarUrl;
  }

  // Generar avatar de respaldo
  private generateFallbackAvatar(): string {
    // Si tenemos el nombre del usuario, generar avatar con iniciales
    if (this.user?.name) {
      const name = encodeURIComponent(this.user.name);
      return `https://ui-avatars.com/api/?name=${name}&background=667eea&color=ffffff&size=200&font-size=0.6`;
    }
    
    // Avatar genérico si no hay nombre
    return 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }

  // Manejar error de carga de imagen
  onImageError(event: any) {
    console.error('❌ Error loading image:', event.target.src);
    const fallbackUrl = this.generateFallbackAvatar();
    console.log('🔄 Switching to fallback:', fallbackUrl);
    event.target.src = fallbackUrl;
  }

  // Confirmar carga exitosa de imagen
  onImageLoad(event: any) {
    console.log('✅ Image loaded successfully:', event.target.src);
  }

  // Obtener las iniciales del usuario
  getUserInitials(): string {
    if (!this.user?.name) return '?';
    
    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/explore']);
  }
}