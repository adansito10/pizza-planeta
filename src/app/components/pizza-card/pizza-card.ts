import { Component, input, inject } from '@angular/core';
import { Pizza, CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

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
  private readonly authService = inject(AuthService);

  public ordenar(): void {
    if (!this.authService.isCustomerLoggedIn()) {
      this.cartService.activeModal.set('customerAuth');
    } else {
      this.cartService.openSizeModal(this.pizza());
    }
  }
}
