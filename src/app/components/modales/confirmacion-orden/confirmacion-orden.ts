import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-confirmacion-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion-orden.html',
  styleUrl: './confirmacion-orden.scss'
})
export class ConfirmacionOrden {
  public readonly cartService = inject(CartService);

  public imprimirTicket(): void {
    window.print();
  }

  public nuevaOrden(): void {
    this.cartService.closeModal();
  }
}
