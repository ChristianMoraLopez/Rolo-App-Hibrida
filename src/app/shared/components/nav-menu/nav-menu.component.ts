import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class NavMenuComponent implements OnInit {
  isAuthenticated = false;
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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