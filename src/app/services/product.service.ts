import { Injectable, signal } from '@angular/core';
import { Pizza, SizeOption, IngredientOption } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_PIZZAS = 'planet_pizza_catalog_pizzas';
  private readonly STORAGE_SIZES = 'planet_pizza_catalog_sizes';
  private readonly STORAGE_INGREDIENTS = 'planet_pizza_catalog_ingredients';

  // Default values
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

  constructor() {
    this.loadCatalog();
  }

  // --- PIZZAS CRUD ---
  public addPizza(pizza: Omit<Pizza, 'id'>): void {
    const id = pizza.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
    this.pizzas.update(items => [...items, { ...pizza, id }]);
    this.savePizzas();
  }

  public updatePizza(updated: Pizza): void {
    this.pizzas.update(items => items.map(p => p.id === updated.id ? updated : p));
    this.savePizzas();
  }

  public deletePizza(id: string): void {
    this.pizzas.update(items => items.filter(p => p.id !== id));
    this.savePizzas();
  }

  // --- SIZES CRUD ---
  public addSize(size: SizeOption): void {
    this.sizes.update(items => [...items, size]);
    this.saveSizes();
  }

  public updateSize(oldName: string, updated: SizeOption): void {
    this.sizes.update(items => items.map(s => s.nombre === oldName ? updated : s));
    this.saveSizes();
  }

  public deleteSize(name: string): void {
    this.sizes.update(items => items.filter(s => s.nombre !== name));
    this.saveSizes();
  }

  // --- INGREDIENTS CRUD ---
  public addIngredient(ing: IngredientOption): void {
    this.ingredients.update(items => [...items, ing]);
    this.saveIngredients();
  }

  public updateIngredient(oldName: string, updated: IngredientOption): void {
    this.ingredients.update(items => items.map(i => i.nombre === oldName ? updated : i));
    this.saveIngredients();
  }

  public deleteIngredient(name: string): void {
    this.ingredients.update(items => items.filter(i => i.nombre !== name));
    this.saveIngredients();
  }

  // --- GLOBAL RESET ---
  public resetCatalog(): void {
    this.pizzas.set([...this.defaultPizzas]);
    this.sizes.set([...this.defaultSizes]);
    this.ingredients.set([...this.defaultIngredients]);
    this.saveAll();
  }

  // --- STORAGE HELPERS ---
  private savePizzas(): void {
    localStorage.setItem(this.STORAGE_PIZZAS, JSON.stringify(this.pizzas()));
  }

  private saveSizes(): void {
    localStorage.setItem(this.STORAGE_SIZES, JSON.stringify(this.sizes()));
  }

  private saveIngredients(): void {
    localStorage.setItem(this.STORAGE_INGREDIENTS, JSON.stringify(this.ingredients()));
  }

  private saveAll(): void {
    this.savePizzas();
    this.saveSizes();
    this.saveIngredients();
  }

  private loadCatalog(): void {
    try {
      const storedPizzas = localStorage.getItem(this.STORAGE_PIZZAS);
      const storedSizes = localStorage.getItem(this.STORAGE_SIZES);
      const storedIngredients = localStorage.getItem(this.STORAGE_INGREDIENTS);

      if (storedPizzas) {
        const parsed = JSON.parse(storedPizzas) as Pizza[];
        // Upgrade database logic (if recipes default values are missing)
        const upgraded = parsed.map(pizza => {
          const matchDefault = this.defaultPizzas.find(d => d.id === pizza.id);
          if (matchDefault && (!pizza.defaultMasa || !pizza.defaultSalsa || !pizza.defaultQueso)) {
            return {
              ...pizza,
              defaultMasa: pizza.defaultMasa || matchDefault.defaultMasa,
              defaultSalsa: pizza.defaultSalsa || matchDefault.defaultSalsa,
              defaultQueso: pizza.defaultQueso || matchDefault.defaultQueso,
              defaultExtras: pizza.defaultExtras || matchDefault.defaultExtras
            };
          }
          return pizza;
        });
        this.pizzas.set(upgraded);
      } else {
        this.pizzas.set([...this.defaultPizzas]);
        this.savePizzas();
      }


      if (storedSizes) {
        this.sizes.set(JSON.parse(storedSizes));
      } else {
        this.sizes.set([...this.defaultSizes]);
        this.saveSizes();
      }

      if (storedIngredients) {
        this.ingredients.set(JSON.parse(storedIngredients));
      } else {
        this.ingredients.set([...this.defaultIngredients]);
        this.saveIngredients();
      }
    } catch (e) {
      console.error('Error loading catalog data', e);
      this.pizzas.set([...this.defaultPizzas]);
      this.sizes.set([...this.defaultSizes]);
      this.ingredients.set([...this.defaultIngredients]);
    }
  }
}
