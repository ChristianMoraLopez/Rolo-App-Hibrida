import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '@services/cart.service';
import { Cart } from '@entities/types';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/locations/premium"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Carrito</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cart-container">
        <ng-container *ngIf="(cart$ | async) as cart">
          <div class="cart-items" *ngIf="cart.items.length > 0; else emptyCart">
            <ion-list>
              <ion-item-sliding *ngFor="let item of cart.items">
                <ion-item class="cart-item">
                  <ion-thumbnail slot="start">
                    <img [src]="item.location.image" [alt]="item.location.name">
                  </ion-thumbnail>
                  
                  <ion-label>
                    <h2>{{ item.location.name }}</h2>
                    <p>{{ item.location.description }}</p>
                    <p class="price">{{ item.location.price | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  </ion-label>

                  <div class="quantity-selector">
                    <ion-button fill="clear" (click)="updateQuantity(item.location._id, item.quantity - 1)">
                      <ion-icon name="remove-circle-outline"></ion-icon>
                    </ion-button>
                    <span>{{ item.quantity }}</span>
                    <ion-button fill="clear" (click)="updateQuantity(item.location._id, item.quantity + 1)">
                      <ion-icon name="add-circle-outline"></ion-icon>
                    </ion-button>
                  </div>
                </ion-item>

                <ion-item-options side="end">
                  <ion-item-option color="danger" (click)="removeFromCart(item.location._id)">
                    <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ cart.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="summary-row">
                <span>IVA (19%)</span>
                <span>{{ cart.total * 0.19 | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ cart.total * 1.19 | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>

            <ion-button expand="block" (click)="checkout()" [disabled]="isLoading">
              <ion-spinner *ngIf="isLoading"></ion-spinner>
              <span *ngIf="!isLoading">Proceder al pago</span>
            </ion-button>
          </div>

          <ng-template #emptyCart>
            <div class="empty-cart">
              <ion-icon name="cart-outline"></ion-icon>
              <h2>Tu carrito está vacío</h2>
              <p>¡Explora nuestras locaciones premium y encuentra algo increíble!</p>
              <ion-button routerLink="/locations/premium" fill="clear">
                Ver locaciones premium
              </ion-button>
            </div>
          </ng-template>
        </ng-container>
      </div>
    </ion-content>
  `,
  styleUrls: ['./cart.page.scss']
})
export class CartPage {
  cart$ = this.cartService.cart$;
  isLoading = false;

  constructor(private cartService: CartService) {}

  updateQuantity(locationId: string, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateQuantity(locationId, quantity);
  }

  removeFromCart(locationId: string) {
    this.cartService.removeFromCart(locationId);
  }

  async checkout() {
    this.isLoading = true;
    try {
      await this.cartService.checkout();
      // Aquí podrías mostrar un mensaje de éxito y redirigir
    } catch (error) {
      // Manejar el error
      console.error('Error en el checkout:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
