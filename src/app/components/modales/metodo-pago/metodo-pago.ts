import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metodo-pago.html',
  styleUrl: './metodo-pago.scss'
})
export class MetodoPago {
  public readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  public close(): void {
    this.cartService.closeModal();
  }

  public selectMethod(method: 'Efectivo' | 'MercadoPago'): void {
    if (method === 'Efectivo') {
      const customer = this.authService.customerUser();
      const nombre = customer ? `${customer.nombre || ''} ${customer.apellido || ''}`.trim() : 'Cliente';
      this.cartService.tempCustomerName.set(nombre);
      this.cartService.tempCustomerPhone.set('');
      this.cartService.confirmOrder(nombre, 'Efectivo');
    } else {
      this.cartService.tempPaymentMethod.set(method);
      this.cartService.activeModal.set('name');
    }
  }
}
