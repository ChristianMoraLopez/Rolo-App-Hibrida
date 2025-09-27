import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LocationService } from '../../../core/services/location.service';
import { CartService } from '../../../services/cart.service';


@Component({
  selector: 'app-premium-locations',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Locaciones Premium</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="premium-container">
        <div class="premium-header">
          <h1>Locaciones Premium</h1>
          <p>Descubre lugares exclusivos para tus eventos</p>
        </div>

        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6" *ngFor="let location of premiumLocations$ | async">
              <ion-card class="premium-card">
                <img [src]="location.image" [alt]="location.name"/>
                <ion-card-header>
                  <ion-card-title>{{ location.name }}</ion-card-title>
                  <ion-card-subtitle>{{ location.price | currency:'COP':'symbol-narrow':'1.0-0' }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p>{{ location.description }}</p>
                  <ion-button expand="block" (click)="addToCart(location)">
                    <ion-icon name="cart-outline" slot="start"></ion-icon>
                    Agregar al carrito
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `,
  styleUrls: ['./premium-locations.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PremiumLocationsPage implements OnInit {
  premiumLocations$ = this.locationService.getPremiumLocations();

  constructor(
    private locationService: LocationService,
    private cartService: CartService
  ) {}

  ngOnInit() {}

  addToCart(location: any) {
    this.cartService.addToCart(location);
  }
}
