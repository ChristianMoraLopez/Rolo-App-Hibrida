import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-container">
          <img src="/src/assets/bogotabw.png" alt="Rolo App Logo" />
          <h1>Bienvenido a Sensaciones Bogotá</h1>
          <p>Ingresa para conectar con otros bogotanos</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <ion-list class="auth-form">
            <ion-item>
              <ion-input 
                label="Correo electrónico" 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input 
                label="Contraseña" 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required>
              </ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" type="submit" [disabled]="!loginForm.form.valid || isLoading">
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </ion-button>

          <div class="divider">
            <span>O</span>
          </div>

          <ion-button expand="block" color="light" (click)="loginWithGoogle()">
            <ion-icon src="assets/icons/google.svg" slot="start"></ion-icon>
            Continuar con Google
          </ion-button>

          <p class="register-link">
            ¿No tienes cuenta? 
            <a routerLink="/register">Regístrate aquí</a>
          </p>
        </form>
      </div>
    </ion-content>
  `,
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/explore']);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    // Implement Google login
  }
}
