// src/app/shared/components/layout/app-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    NavMenuComponent,
  ]
})
export class AppLayoutComponent {
  cartItemCount$ = this.cartService.cart$.pipe(
    map(cart => cart.items.reduce((acc: number, item) => acc + item.quantity, 0))
  );

  constructor(
    private cartService: CartService,
    private menuCtrl: MenuController
  ) {
    // ✅ Habilitar el menú principal
    this.menuCtrl.enable(true, 'main-menu');

    // Debug del carrito
    this.cartItemCount$.subscribe(count => {
      console.log('🛒 Cart items count:', count);
    });

    this.cartService.cart$.subscribe(cart => {
      console.log('🛒 Cart state:', cart);
    });
  }
}