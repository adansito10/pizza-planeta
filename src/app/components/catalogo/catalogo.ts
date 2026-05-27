import { Component } from '@angular/core';
import { PizzaCard } from '../pizza-card/pizza-card';
import { Pizza } from '../../services/cart.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [PizzaCard],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo {
  public readonly pizzas: Pizza[] = [
    {
      id: 'pepperoni',
      nombre: 'Pepperoni',
      descripcion: 'Clásica pizza con abundante pepperoni y queso mozzarella premium sobre salsa de tomate de la casa.',
      imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    },
    {
      id: 'margarita',
      nombre: 'Margarita',
      descripcion: 'Tomate cherry dulce, láminas de mozzarella fresca y hojas de albahaca fresca con un toque de aceite de oliva.',
      imagen: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    },
    {
      id: 'hawaiana',
      nombre: 'Hawaiana',
      descripcion: 'La combinación agridulce favorita: jamón cocido seleccionado y trozos de piña jugosa sobre abundante mozzarella.',
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    },
    {
      id: 'vegetariana',
      nombre: 'Vegetariana',
      descripcion: 'Mezcla fresca de pimientos morrón verdes, champiñones laminados, cebolla morada y aceitunas negras fileteadas.',
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    },
    {
      id: 'cuatro-quesos',
      nombre: 'Cuatro Quesos',
      descripcion: 'Una rica fusión de quesos finos: mozzarella, parmesano rallado, gorgonzola cremoso y provolone ahumado.',
      imagen: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    },
    {
      id: 'mexicana',
      nombre: 'Mexicana',
      descripcion: 'Toque nacional con jalapeños picantes, chorizo artesanal, frijoles refritos untados y queso cheddar fundido.',
      imagen: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
      precioBase: 199
    }
  ];
}
