import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-seleccion-nombre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccion-nombre.html',
  styleUrl: './seleccion-nombre.scss'
})
export class SeleccionNombre {
  public readonly cartService = inject(CartService);
  public nombre = '';

  public close(): void {
    this.cartService.closeModal();
    this.nombre = '';
  }

  public confirmar(): void {
    if (!this.nombre.trim()) {
      alert('Por favor ingresa tu nombre para continuar.');
      return;
    }
    this.cartService.tempCustomerName.set(this.nombre.trim());
    this.cartService.activeModal.set('payment');
    this.nombre = '';
  }
}
