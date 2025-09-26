import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem, PremiumLocation, User } from '../entities/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    total: 0,
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  cart$ = this.cartSubject.asObservable();

  constructor(private authService: AuthService) {
    // Inicializar carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartSubject.next(JSON.parse(savedCart));
    }

    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.cartSubject.value.userId = user._id;
        this.updateCart(this.cartSubject.value);
      }
    });
  }

  // Mock de locaciones premium
  getMockPremiumLocations(): PremiumLocation[] {
    return [
      {
        _id: '1',
        name: 'Mirador Monserrate VIP',
        description: 'Acceso exclusivo al mirador de Monserrate con área privada y servicio personalizado',
        price: 150000,
        image: 'assets/locations/monserrate-vip.jpg',
        features: ['Área privada', 'Servicio personalizado', 'Parking VIP', 'Guía turístico'],
        category: 'VIP',
        rating: 4.8,
        reviews: 124,
        isAvailable: true
      },
      {
        _id: '2',
        name: 'Tour Candelaria Premium',
        description: 'Recorrido exclusivo por La Candelaria con acceso a lugares históricos privados',
        price: 200000,
        image: 'assets/locations/candelaria-premium.jpg',
        features: ['Acceso exclusivo', 'Guía experto', 'Degustación local', 'Transporte privado'],
        category: 'PREMIUM',
        rating: 4.9,
        reviews: 89,
        isAvailable: true
      },
      {
        _id: '3',
        name: 'Experiencia Botero Exclusive',
        description: 'Visita privada al Museo Botero fuera de horario regular con curador personal',
        price: 300000,
        image: 'assets/locations/botero-exclusive.jpg',
        features: ['Visita privada', 'Curador personal', 'Catálogo exclusivo', 'Cóctel de bienvenida'],
        category: 'EXCLUSIVE',
        rating: 5.0,
        reviews: 45,
        isAvailable: true
      }
    ];
  }

  private updateCart(cart: Cart) {
    // Actualizar el total
    cart.total = cart.items.reduce((total, item) => total + (item.location.price * item.quantity), 0);
    cart.updatedAt = new Date();
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar el BehaviorSubject
    this.cartSubject.next({ ...cart });
  }

  addToCart(location: PremiumLocation, quantity: number = 1) {
    const currentCart = { ...this.cartSubject.value };
    const existingItemIndex = currentCart.items.findIndex(item => item.location._id === location._id);

    if (existingItemIndex > -1) {
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      currentCart.items.push({ location, quantity });
    }

    this.updateCart(currentCart);
  }

  removeFromCart(locationId: string) {
    const currentCart = { ...this.cartSubject.value };
    currentCart.items = currentCart.items.filter(item => item.location._id !== locationId);
    this.updateCart(currentCart);
  }

  updateQuantity(locationId: string, quantity: number) {
    const currentCart = { ...this.cartSubject.value };
    const item = currentCart.items.find(item => item.location._id === locationId);
    
    if (item) {
      item.quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  clearCart() {
    const emptyCart: Cart = {
      items: [],
      total: 0,
      userId: this.cartSubject.value.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.updateCart(emptyCart);
  }

  getCartItemCount(): Observable<number> {
    return new BehaviorSubject<number>(
      this.cartSubject.value.items.reduce((count, item) => count + item.quantity, 0)
    );
  }

  // Mock de checkout
  async checkout(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clearCart();
        resolve(true);
      }, 2000);
    });
  }
}
