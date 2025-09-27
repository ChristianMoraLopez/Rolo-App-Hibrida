import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  location: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    total: 0
  });

  cart$ = this.cartSubject.asObservable();

  addToCart(location: any) {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(item => item.location._id === location._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.items.push({ location, quantity: 1 });
    }

    this.updateCart(currentCart);
  }

  private updateCart(cart: Cart) {
    cart.total = cart.items.reduce((total, item) => 
      total + (item.location.price * item.quantity), 0);
    this.cartSubject.next({ ...cart });
  }

  // Additional cart methods...
}
