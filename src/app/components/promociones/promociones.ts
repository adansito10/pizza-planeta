import { Component, inject } from '@angular/core';
import { CartService, Pizza, Promo } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss'
})
export class Promociones {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);

  public get promos(): Promo[] {
    return this.productService.promos();
  }

  public ordenarPromo(promo: Promo): void {
    if (!this.authService.isCustomerLoggedIn()) {
      this.cartService.activeModal.set('customerAuth');
    } else {
      this.cartService.addPromoToCartDirectly(promo);
    }
  }
}
