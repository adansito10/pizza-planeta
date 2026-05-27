import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito {
  public readonly cartService = inject(CartService);

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
    this.cartService.confirmOrder();
  }
}
