import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  user$ = this.userSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private router: Router) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const { user, token } = JSON.parse(storedAuth);
      this.setAuthState(user, token);
    }
  }

  private setAuthState(user: any, token: string): void {
    this.userSubject.next(user);
    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('auth', JSON.stringify({ user, token }));
  }

  private clearAuthState(): void {
    localStorage.removeItem('auth');
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en el inicio de sesión');
      }

      const { user, token } = await response.json();
      this.setAuthState(user, token);
      this.router.navigate(['/bogotanos']);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async loginWithGoogle(credential: string): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential,
          authProvider: 'google',
          role: 'registered'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('E11000 duplicate key error')) {
          throw new Error('Ya existe una cuenta con este correo electrónico.');
        }
        throw new Error(errorData.message || 'Error en la autenticación con Google');
      }

      const authResponse: AuthResponse = await response.json();
      if (!authResponse.user || !authResponse.token) {
        throw new Error('Respuesta del servidor incompleta');
      }

      this.setAuthState(authResponse.user, authResponse.token);
      this.router.navigate(['/bogotanos']);
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      throw error;
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        this.clearAuthState();
        return false;
      }

      const { user, token } = await response.json();
      if (!user || !token) {
        this.clearAuthState();
        return false;
      }

      this.setAuthState(user, token);
      return true;
    } catch (error) {
      console.error('Error checking session:', error);
      this.clearAuthState();
      return false;
    }
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en el registro');
      }

      const { user, token } = await response.json();
      this.setAuthState(user, token);
      this.router.navigate(['/explore']);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }
}
