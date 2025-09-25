import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    // Check localStorage on init
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
      this.isAuthenticatedSubject.next(true);
    }
  }

  async login(email: string, password: string): Promise<void> {
    // Implement your login logic here
    // After successful login:
    const mockUser = { name: 'Usuario', email, avatar: null };
    this.userSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    this.router.navigate(['/bogotanos']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    // Implement actual registration logic here
    const mockUser = { name, email, avatar: null };
    this.userSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    this.router.navigate(['/explore']);
  }
}
