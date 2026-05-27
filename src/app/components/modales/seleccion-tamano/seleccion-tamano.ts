import { Component, inject } from '@angular/core';
import { CartService, SizeOption } from '../../../services/cart.service';

@Component({
  selector: 'app-seleccion-tamano',
  standalone: true,
  imports: [],
  templateUrl: './seleccion-tamano.html',
  styleUrl: './seleccion-tamano.scss'
})
export class SeleccionTamano {
  public readonly cartService = inject(CartService);

  public selectSize(size: SizeOption): void {
    this.cartService.selectSize(size);
  }

  public close(): void {
    this.cartService.closeModal();
  }
}
