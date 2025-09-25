import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, NavMenuComponent]
})
export class AppLayoutComponent {}