import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metodo-pago.html',
  styleUrl: './metodo-pago.scss'
})
export class MetodoPago {
  public readonly cartService = inject(CartService);

  public close(): void {
    this.cartService.closeModal();
  }

  public selectMethod(method: 'Efectivo' | 'MercadoPago'): void {
    const name = this.cartService.tempCustomerName();
    this.cartService.confirmOrder(name, method);
  }
}
