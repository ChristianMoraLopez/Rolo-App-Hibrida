import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CartService } from '../../../core/services/cart.service';
import { PremiumLocation } from '../../../core/entities/types';

@Component({
  selector: 'app-premium-locations',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/explore"></ion-back-button>
        </ion-buttons>
        <ion-title>Locaciones Premium</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/cart">
            <ion-icon name="cart-outline"></ion-icon>
            <ion-badge *ngIf="cartItemCount$ | async as count">{{ count }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="premium-locations-container">
        <ion-list>
          <ion-item-sliding *ngFor="let location of premiumLocations">
            <ion-item class="premium-location-card">
              <div class="location-image">
                <img [src]="location.image" [alt]="location.name">
                <div class="location-category">{{ location.category }}</div>
              </div>
              
              <div class="location-content">
                <h2>{{ location.name }}</h2>
                <p class="description">{{ location.description }}</p>
                
                <div class="location-features">
                  <ion-chip *ngFor="let feature of location.features">
                    <ion-label>{{ feature }}</ion-label>
                  </ion-chip>
                </div>

                <div class="location-footer">
                  <div class="rating">
                    <ion-icon name="star"></ion-icon>
                    {{ location.rating }}
                    <span class="reviews">({{ location.reviews }} reseñas)</span>
                  </div>
                  
                  <div class="price-action">
                    <div class="price">
                      {{ location.price | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </div>
                    <ion-button 
                      (click)="addToCart(location)"
                      [disabled]="!location.isAvailable">
                      <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                      Agregar
                    </ion-button>
                  </div>
                </div>
              </div>
            </ion-item>
          </ion-item-sliding>
        </ion-list>
      </div>
    </ion-content>
  `,
  styleUrls: ['./premium-locations.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PremiumLocationsPage implements OnInit {
  premiumLocations: PremiumLocation[] = [];
  cartItemCount$ = this.cartService.getCartItemCount();

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.premiumLocations = this.cartService.getMockPremiumLocations();
  }

  addToCart(location: PremiumLocation) {
    this.cartService.addToCart(location);
  }
}
