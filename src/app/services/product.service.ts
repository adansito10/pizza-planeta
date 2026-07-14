import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pizza, SizeOption, IngredientOption, Promo } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api-pizzeria-production.up.railway.app/api';

  // Valores predeterminados en memoria (para resetear si el usuario lo desea)
  public readonly defaultPizzas: Pizza[] = [
    {
      id: 'pepperoni',
      nombre: 'Pepperoni',
      descripcion: 'Clásica pizza con abundante pepperoni y queso mozzarella premium sobre salsa de tomate de la casa.',
      imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Mozzarella',
      defaultExtras: ['Pepperoni']
    },
    {
      id: 'margarita',
      nombre: 'Margarita',
      descripcion: 'Tomate cherry dulce, láminas de mozzarella fresca y hojas de albahaca fresca con un toque de aceite de oliva.',
      imagen: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Mozzarella',
      defaultExtras: ['Tomate']
    },
    {
      id: 'hawaiana',
      nombre: 'Hawaiana',
      descripcion: 'La combinación agridulce favorita: jamón cocido seleccionado y trozos de piña jugosa sobre abundante mozzarella.',
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Mozzarella',
      defaultExtras: ['Jamón', 'Piña']
    },
    {
      id: 'vegetariana',
      nombre: 'Vegetariana',
      descripcion: 'Mezcla fresca de pimientos morrón verdes, champiñones laminados, cebolla morada y aceitunas negras fileteadas.',
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Mozzarella',
      defaultExtras: ['Champiñones', 'Pimientos', 'Cebolla', 'Aceitunas Negras']
    },
    {
      id: 'cuatro-quesos',
      nombre: 'Cuatro Quesos',
      descripcion: 'Una rica fusión de quesos finos: mozzarella, parmesano rallado, gorgonzola cremoso y provolone ahumado.',
      imagen: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Mozzarella',
      defaultExtras: ['Parmesano', 'Cheddar']
    },
    {
      id: 'mexicana',
      nombre: 'Mexicana',
      descripcion: 'Toque nacional con jalapeños picantes, chorizo artesanal, frijoles refritos untados y queso cheddar fundido.',
      imagen: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
      precioBase: 199,
      defaultMasa: 'Tradicional',
      defaultSalsa: 'Salsa de Tomate',
      defaultQueso: 'Cheddar',
      defaultExtras: ['Jalapeños']
    }
  ];

  public readonly defaultSizes: SizeOption[] = [
    { nombre: 'Chica', medida: '8" - 4 rebanadas', precio: 99 },
    { nombre: 'Mediana', medida: '12" - 8 rebanadas', precio: 149 },
    { nombre: 'Grande', medida: '16" - 12 rebanadas', precio: 199 }
  ];

  public readonly defaultIngredients: IngredientOption[] = [
    // Masas
    { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
    { nombre: 'Delgada', precio: 0, categoria: 'masa' },
    { nombre: 'Gruesa', precio: 10, categoria: 'masa' },
    { nombre: 'Orilla Rellena de Queso', precio: 25, categoria: 'masa' },
    // Salsas
    { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
    { nombre: 'BBQ', precio: 10, categoria: 'salsa' },
    { nombre: 'Alfredo', precio: 15, categoria: 'salsa' },
    { nombre: 'Pesto', precio: 15, categoria: 'salsa' },
    // Quesos
    { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
    { nombre: 'Cheddar', precio: 10, categoria: 'queso' },
    { nombre: 'Parmesano', precio: 10, categoria: 'queso' },
    { nombre: 'Mezcla de 3 Quesos', precio: 20, categoria: 'queso' },
    // Extras
    { nombre: 'Pepperoni', precio: 15, categoria: 'extra' },
    { nombre: 'Jamón', precio: 12, categoria: 'extra' },
    { nombre: 'Salchicha Italiana', precio: 15, categoria: 'extra' },
    { nombre: 'Pollo', precio: 15, categoria: 'extra' },
    { nombre: 'Tocino', precio: 18, categoria: 'extra' },
    { nombre: 'Champiñones', precio: 10, categoria: 'extra' },
    { nombre: 'Pimientos', precio: 8, categoria: 'extra' },
    { nombre: 'Cebolla', precio: 8, categoria: 'extra' },
    { nombre: 'Aceitunas Negras', precio: 10, categoria: 'extra' },
    { nombre: 'Piña', precio: 10, categoria: 'extra' },
    { nombre: 'Tomate', precio: 8, categoria: 'extra' },
    { nombre: 'Jalapeños', precio: 8, categoria: 'extra' }
  ];

  // Dynamic signals
  public readonly pizzas = signal<Pizza[]>([]);
  public readonly sizes = signal<SizeOption[]>([]);
  public readonly ingredients = signal<IngredientOption[]>([]);
  public readonly promos = signal<Promo[]>([]);

  constructor() {
    this.loadCatalog();
  }

  // --- PIZZAS CRUD ---
  public addPizza(pizza: Omit<Pizza, 'id'>): void {
    this.http.post<Pizza>(`${this.apiUrl}/pizzas`, pizza).subscribe({
      next: (data) => {
        this.pizzas.update(items => [...items, data]);
      },
      error: (err) => console.error('Error al agregar pizza', err)
    });
  }

  public updatePizza(updated: Pizza): void {
    this.http.put<Pizza>(`${this.apiUrl}/pizzas/${updated.id}`, updated).subscribe({
      next: (data) => {
        this.pizzas.update(items => items.map(p => p.id === updated.id ? { ...p, ...data } : p));
      },
      error: (err) => console.error('Error al actualizar pizza', err)
    });
  }

  public deletePizza(id: string): void {
    this.http.delete(`${this.apiUrl}/pizzas/${id}`).subscribe({
      next: () => {
        this.pizzas.update(items => items.filter(p => p.id !== id));
      },
      error: (err) => console.error('Error al eliminar pizza', err)
    });
  }

  // --- SIZES CRUD ---
  public addSize(size: SizeOption): void {
    this.http.post<SizeOption>(`${this.apiUrl}/catalog/sizes`, size).subscribe({
      next: (data) => {
        this.sizes.update(items => [...items, data]);
      },
      error: (err) => console.error('Error al agregar tamaño', err)
    });
  }

  public updateSize(oldName: string, updated: SizeOption): void {
    const size = this.sizes().find(s => s.nombre === oldName);
    if (size && size.id) {
      this.http.put<SizeOption>(`${this.apiUrl}/catalog/sizes/${size.id}`, updated).subscribe({
        next: (data) => {
          this.sizes.update(items => items.map(s => s.id === size.id ? { ...s, ...data } : s));
        },
        error: (err) => console.error('Error al actualizar tamaño', err)
      });
    }
  }

  public deleteSize(name: string): void {
    const size = this.sizes().find(s => s.nombre === name);
    if (size && size.id) {
      this.http.delete(`${this.apiUrl}/catalog/sizes/${size.id}`).subscribe({
        next: () => {
          this.sizes.update(items => items.filter(s => s.id !== size.id));
        },
        error: (err) => console.error('Error al eliminar tamaño', err)
      });
    }
  }

  // --- INGREDIENTS CRUD ---
  public addIngredient(ing: IngredientOption): void {
    this.http.post<IngredientOption>(`${this.apiUrl}/catalog/ingredients`, ing).subscribe({
      next: (data) => {
        this.ingredients.update(items => [...items, data]);
      },
      error: (err) => console.error('Error al agregar ingrediente', err)
    });
  }

  public updateIngredient(oldName: string, updated: IngredientOption): void {
    const ing = this.ingredients().find(i => i.nombre === oldName);
    if (ing && ing.id) {
      this.http.put<IngredientOption>(`${this.apiUrl}/catalog/ingredients/${ing.id}`, updated).subscribe({
        next: (data) => {
          this.ingredients.update(items => items.map(i => i.id === ing.id ? { ...i, ...data } : i));
        },
        error: (err) => console.error('Error al actualizar ingrediente', err)
      });
    }
  }

  public deleteIngredient(name: string): void {
    const ing = this.ingredients().find(i => i.nombre === name);
    if (ing && ing.id) {
      this.http.delete(`${this.apiUrl}/catalog/ingredients/${ing.id}`).subscribe({
        next: () => {
          this.ingredients.update(items => items.filter(i => i.id !== ing.id));
        },
        error: (err) => console.error('Error al eliminar ingrediente', err)
      });
    }
  }

  // --- PROMOS CRUD ---
  public addPromo(promo: any): void {
    this.http.post<Promo>(`${this.apiUrl}/promos`, promo).subscribe({
      next: (data) => {
        this.promos.update(items => [...items, data]);
      },
      error: (err) => console.error('Error al agregar promoción', err)
    });
  }

  public updatePromo(updated: any): void {
    this.http.put<Promo>(`${this.apiUrl}/promos/${updated.id}`, updated).subscribe({
      next: (data) => {
        this.promos.update(items => items.map(p => p.id === updated.id ? { ...p, ...data } : p));
      },
      error: (err) => console.error('Error al actualizar promoción', err)
    });
  }

  public deletePromo(id: string): void {
    this.http.delete(`${this.apiUrl}/promos/${id}`).subscribe({
      next: () => {
        this.promos.update(items => items.filter(p => p.id !== id));
      },
      error: (err) => console.error('Error al eliminar promoción', err)
    });
  }

  // --- GLOBAL RESET ---
  public resetCatalog(): void {
    // Eliminar todo
    this.promos().forEach(pr => this.deletePromo(pr.id));
    this.pizzas().forEach(p => this.deletePizza(p.id));
    this.sizes().forEach(s => { if (s.nombre) this.deleteSize(s.nombre); });
    this.ingredients().forEach(i => { if (i.nombre) this.deleteIngredient(i.nombre); });

    // Recrear datos por defecto tras breves delays para evitar colisiones
    setTimeout(() => {
      this.defaultSizes.forEach(s => this.addSize(s));
      this.defaultIngredients.forEach(i => this.addIngredient(i));
      
      setTimeout(() => {
        this.defaultPizzas.forEach(p => {
          const { id, ...pizzaData } = p;
          this.addPizza(pizzaData);
        });
      }, 1000);
    }, 1000);
  }

  private loadCatalog(): void {
    this.http.get<Pizza[]>(`${this.apiUrl}/pizzas`).subscribe({
      next: (data) => this.pizzas.set(data),
      error: (err) => console.error('Error al cargar pizzas', err)
    });

    this.http.get<SizeOption[]>(`${this.apiUrl}/catalog/sizes`).subscribe({
      next: (data) => this.sizes.set(data),
      error: (err) => console.error('Error al cargar tamaños', err)
    });

    this.http.get<IngredientOption[]>(`${this.apiUrl}/catalog/ingredients`).subscribe({
      next: (data) => this.ingredients.set(data),
      error: (err) => console.error('Error al cargar ingredientes', err)
    });

    this.http.get<Promo[]>(`${this.apiUrl}/promos`).subscribe({
      next: (data) => this.promos.set(data),
      error: (err) => console.error('Error al cargar promociones', err)
    });
  }
}
