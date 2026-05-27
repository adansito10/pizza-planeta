import { Component, input, inject } from '@angular/core';
import { Pizza, CartService } from '../../services/cart.service';

@Component({
  selector: 'app-pizza-card',
  standalone: true,
  imports: [],
  templateUrl: './pizza-card.html',
  styleUrl: './pizza-card.scss'
})
export class PizzaCard {
  public readonly pizza = input.required<Pizza>();
  private readonly cartService = inject(CartService);

  public ordenar(): void {
    this.cartService.openSizeModal(this.pizza());
  }
}
