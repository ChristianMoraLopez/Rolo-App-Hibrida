import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: `
    <ion-content class="ion-padding">
      <div class="register-container">
        <div class="logo-container">
          <img src="assets/images/bogotabw.png" alt="Rolo App Logo" />
          <h1>Únete a Sensaciones Bogotá</h1>
          <p>Crea tu cuenta para empezar</p>
        </div>

        <form (ngSubmit)="onRegister()" #registerForm="ngForm">
          <ion-list class="auth-form">
            <ion-item>
              <ion-input 
                label="Nombre completo" 
                type="text" 
                [(ngModel)]="name" 
                name="name" 
                required>
              </ion-input>
            </ion-item>

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

          <ion-button expand="block" type="submit" [disabled]="!registerForm.form.valid || isLoading">
            {{ isLoading ? 'Registrando...' : 'Registrarse' }}
          </ion-button>

          <p class="login-link">
            ¿Ya tienes cuenta? 
            <a routerLink="/login">Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </ion-content>
  `,
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister() {
    if (!this.name || !this.email || !this.password) return;
    
    this.isLoading = true;
    try {
      await this.authService.register(this.name, this.email, this.password);
      this.router.navigate(['/explore']);
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
