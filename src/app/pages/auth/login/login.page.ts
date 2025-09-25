import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  template: `
    <ion-content>
      <div class="login-wrapper">
        <div class="login-container">
          <div class="logo-container">
            <img src="assets/bogotabw.png" alt="Rolo App Logo" />
            <h1 class="gradient-text">Bienvenido a Rolo App</h1>
            <p>Ingresa para conectar con otros bogotanos</p>
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
            <ion-item>
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              <ion-input 
                placeholder="Correo electrónico"
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
              <ion-input 
                placeholder="Contraseña"
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required>
              </ion-input>
            </ion-item>

            <ion-button 
              expand="block" 
              type="submit" 
              class="button-primary" 
              [class.button-loading]="isLoading"
              [disabled]="!loginForm.form.valid || isLoading">
              {{ isLoading ? '' : 'Iniciar Sesión' }}
            </ion-button>

            <div class="divider">
              <span>O</span>
            </div>

            <!-- Botón de Google personalizado -->
            <ion-button 
              expand="block"
              type="button"
              class="button-google"
              [class.button-loading]="isGoogleLoading"
              [disabled]="isGoogleLoading"
              (click)="handleGoogleSignIn()">
              <div class="google-button-content" *ngIf="!isGoogleLoading">
                <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </div>
            </ion-button>

            <!-- Div oculto para el botón original de Google (para funcionalidad) -->
            <div id="googleBtn" class="google-btn-hidden"></div>

            <p class="register-link">
              ¿No tienes cuenta? 
              <a routerLink="/auth/register">Regístrate aquí</a>
            </p>
          </form>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  isGoogleLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCredential.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Renderizar el botón oculto para funcionalidad
      google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: '100%',
          logo_alignment: 'center',
          locale: 'es_ES'
        }
      );
    };
  }

  handleGoogleSignIn() {
    this.isGoogleLoading = true;
    // Simular click en el botón oculto de Google
    const googleBtn = document.getElementById('googleBtn')?.querySelector('div[role="button"]') as HTMLElement;
    if (googleBtn) {
      googleBtn.click();
    }
  }

  private async handleGoogleCredential(response: any) {
    if (response.credential) {
      this.ngZone.run(async () => {
        try {
          await this.authService.loginWithGoogle(response.credential);
          this.router.navigate(['/explore']);
        } catch (error: any) {
          console.error('Google login error:', error);
          // Aquí podrías mostrar un toast con el error
          if (error.message.includes('Ya existe una cuenta')) {
            // Manejar caso de cuenta existente
          }
        } finally {
          this.isGoogleLoading = false;
        }
      });
    } else {
      this.isGoogleLoading = false;
    }
  }

  async onLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/explore']);
    } catch (error) {
      console.error('Login error:', error);
      // Aquí podrías mostrar un toast o alert con el error
    } finally {
      this.isLoading = false;
    }
  }
}