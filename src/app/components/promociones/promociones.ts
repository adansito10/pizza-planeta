import { Component, inject } from '@angular/core';
import { CartService, Pizza, Promo } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

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

  public get promos(): Promo[] {
    return this.productService.promos();
  }

  public ordenarPromo(promo: Promo): void {
    // Directly add promo to cart using its default configuration and set promo price
    this.cartService.addPromoToCartDirectly(promo);
  }
}
