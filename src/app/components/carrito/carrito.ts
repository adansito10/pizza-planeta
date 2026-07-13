import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito {
  public readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public incrementar(item: CartItem): void {
    this.cartService.updateQuantity(item.id, 1);
  }

  public decrementar(item: CartItem): void {
    this.cartService.updateQuantity(item.id, -1);
  }

  public eliminar(item: CartItem): void {
    this.cartService.removeFromCart(item.id);
  }

  public confirmar(): void {
    if (this.cartService.cart().length === 0) return;
    
    // Check if customer is logged in
    if (!this.authService.isCustomerLoggedIn()) {
      this.cartService.showCart.set(false);
      this.cartService.activeModal.set('customerAuth');
      return;
    }

    // Customer is logged in. Close cart drawer and open payment selector
    this.cartService.showCart.set(false);
    const customer = this.authService.customerUser();
    this.cartService.tempCustomerName.set(customer?.nombre || 'Cliente');
    this.cartService.activeModal.set('payment');
  }
}
