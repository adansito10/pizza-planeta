import { Component, inject } from '@angular/core';
import { PizzaCard } from '../pizza-card/pizza-card';
import { ProductService } from '../../services/product.service';
import { Pizza } from '../../services/cart.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [PizzaCard],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo {
  private readonly productService = inject(ProductService);

  public get pizzas(): Pizza[] {
    return this.productService.pizzas();
  }
}

