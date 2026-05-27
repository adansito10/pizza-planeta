import { Component, inject } from '@angular/core';
import { CartService, Pizza } from '../../services/cart.service';

interface Promo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  pizzaBase: Pizza;
  badge: string;
}

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss'
})
export class Promociones {
  private readonly cartService = inject(CartService);

  public readonly promos: Promo[] = [
    {
      id: 'combo-pareja',
      nombre: 'Combo Pareja',
      descripcion: '1 Pizza Grande de Pepperoni totalmente personalizada + Canasta de Dedos de Queso de cortesía.',
      precio: 249,
      imagen: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
      badge: 'El Favorito',
      pizzaBase: {
        id: 'pepperoni',
        nombre: 'Pepperoni Combo',
        descripcion: 'Pepperoni clásica del combo',
        imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
        precioBase: 199
      }
    },
    {
      id: 'combo-fiesta',
      nombre: 'Combo Fiesta',
      descripcion: '2 Pizzas Medianas (Margarita o Hawaiana) + Papas Gajo familiares + 1 Refresco Familiar de 2L.',
      precio: 399,
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      badge: 'Para Compartir',
      pizzaBase: {
        id: 'hawaiana',
        nombre: 'Hawaiana Combo',
        descripcion: 'Hawaiana clásica del combo',
        imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
        precioBase: 149
      }
    },
    {
      id: 'promo-2x1',
      nombre: 'Martes de 2x1',
      descripcion: 'Ordena cualquier pizza de nuestra carta y la segunda pizza (Margarita clásica) es totalmente GRATIS.',
      precio: 199,
      imagen: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
      badge: 'Sólo Hoy',
      pizzaBase: {
        id: 'margarita',
        nombre: 'Margarita 2x1',
        descripcion: 'Margarita clásica de la promoción',
        imagen: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
        precioBase: 149
      }
    }
  ];

  public ordenarPromo(promo: Promo): void {
    // Open the customizer flow using the promo's base pizza
    this.cartService.openSizeModal(promo.pizzaBase);
  }
}
