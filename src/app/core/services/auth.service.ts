// C:\ChristianMoraProjects\RoloApp\Híbrida\rolo-app\src\app\services\auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@entities/types';
import { environment } from '../../../environments/environment';

export interface AdditionalData {
  authProvider?: string;
  role?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private async loadStoredUser(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const [token, userData] = await Promise.all([
        this.storageService.get(this.TOKEN_KEY),
        this.storageService.get(this.USER_KEY)
      ]);

      console.log('Loading stored user:', {
        tokenPresent: !!token,
        userDataPresent: !!userData
      });

      if (!userData && token) {
        console.log('Token found without user data, attempting recovery...');
        try {
          const userProfile = await this.getUserProfile(token);
          if (userProfile) {
            await this.setUserData(userProfile, token);
          }
        } catch (error) {
          console.error('Could not recover user data, clearing token:', error);
          await this.storageService.remove(this.TOKEN_KEY);
        }
      } else if (token && userData) {
        this.currentUserSubject.next(userData);
        console.log('User loaded successfully:', userData.name || userData.email);
      } else {
        console.log('No valid session data found');
        this.currentUserSubject.next(null);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      await this.clearAuthData();
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async setUserData(userData: User, token: string): Promise<void> {
    try {
      await Promise.all([
        this.storageService.set(this.TOKEN_KEY, token),
        this.storageService.set(this.USER_KEY, userData)
      ]);

      this.currentUserSubject.next(userData);
      console.log('User data and token saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
      this.notificationService.error('Error al guardar los datos de sesión');
      throw error;
    }
  }

  login(loginData: LoginRequest): Observable<User> {
    this.loadingSubject.next(true);
    console.log('Attempting login with:', loginData.email);

    return this.apiService.post<AuthResponse>('auth/login', loginData).pipe(
      tap(response => {
        if (!response || !response.user || !response.token) {
          console.error('Incomplete login response:', response);
          throw new Error('La respuesta del servidor no contiene los datos necesarios');
        }
        return this.setUserData(response.user, response.token);
      }),
      map(response => response.user),
      tap(() => {
        this.notificationService.success('¡Bienvenido de nuevo!');
        this.loadingSubject.next(false);
      })
    );
  }

  register(registerData: RegisterRequest & AdditionalData): Observable<User> {
    this.loadingSubject.next(true);
    console.log('Attempting registration with:', registerData.email);

    const fullRegisterData = {
      ...registerData,
      authProvider: 'email',
      role: 'registered'
    };

    return this.apiService.post<AuthResponse>('auth/register', fullRegisterData).pipe(
      tap(response => {
        if (!response || !response.user || !response.token) {
          console.error('Incomplete registration response:', response);
          throw new Error('La respuesta del servidor no contiene los datos necesarios');
        }
        return this.setUserData(response.user, response.token);
      }),
      map(response => response.user),
      tap(() => {
        this.notificationService.success('¡Registro exitoso! Bienvenido a Rolo App');
        this.loadingSubject.next(false);
      })
    );
  }

  googleLogin(credential: string, additionalData: AdditionalData = {}): Observable<User> {
    this.loadingSubject.next(true);
    console.log('Attempting Google login');

    const payload = {
      credential,
      authProvider: 'google',
      role: 'registered',
      ...additionalData
    };

    return this.apiService.post<AuthResponse>('auth/google', payload).pipe(
      tap(response => {
        if (!response || !response.user || !response.token) {
          throw new Error('La respuesta del servidor es incompleta');
        }
        return this.setUserData(response.user, response.token);
      }),
      map(response => response.user),
      tap({
        next: () => {
          this.notificationService.success('¡Inicio de sesión con Google exitoso!');
          this.loadingSubject.next(false);
        },
        error: (error: any) => {
          const errorMessage = error.message || 'Error en el inicio de sesión con Google';
          if (errorMessage.includes('E11000 duplicate key error')) {
            this.notificationService.error('Ya tienes una cuenta. Por favor, inicia sesión.');
            this.router.navigate(['/auth/login']);
          } else {
            this.notificationService.error(errorMessage);
          }
          this.loadingSubject.next(false);
        }
      })
    );
  }



  private async getUserProfile(token: string): Promise<User> {
    const response = await firstValueFrom(
      this.apiService.get<{ user: User }>('auth/profile')
    );
    if (!response.user) {
      throw new Error('La respuesta del servidor no contiene los datos del usuario');
    }
    return response.user;
  }

  async logout(): Promise<void> {
    try {
      console.log('Logging out...');
      await this.clearAuthData();
      this.currentUserSubject.next(null);
      this.notificationService.success('¡Hasta pronto!');
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      this.notificationService.error('Error al cerrar sesión');
    }
  }

  private async clearAuthData(): Promise<void> {
    await Promise.all([
      this.storageService.remove(this.TOKEN_KEY),
      this.storageService.remove(this.USER_KEY)
    ]);
  }

  async getToken(): Promise<string | null> {
    return this.storageService.get(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  checkRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === requiredRole;
  }

  async protectRoute(requiredRole: string, redirectPath: string = '/auth/login'): Promise<boolean> {
    if (!this.checkRole(requiredRole)) {
      this.notificationService.warning('No tienes permisos para acceder a esta página');
      this.router.navigate([redirectPath]);
      return false;
    }
    return true;
  }

  async refreshUserData(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        const userData = await this.getUserProfile(token);
        await this.storageService.set(this.USER_KEY, userData);
        this.currentUserSubject.next(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  getGoogleClientId(): string {
    return environment.googleClientId;
  }

  getGoogleMapsApiKey(): string {
    return environment.googleMapsApiKey;
  }
}