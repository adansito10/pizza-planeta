import { Injectable, signal, computed } from '@angular/core';

export interface Pizza {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioBase: number;
}

export interface SizeOption {
  nombre: string;
  medida: string;
  precio: number;
}

export interface IngredientOption {
  nombre: string;
  precio: number;
  categoria: 'masa' | 'salsa' | 'queso' | 'extra';
}

export interface CartItem {
  id: string;
  pizza: Pizza;
  size: SizeOption;
  masa: IngredientOption;
  salsa: IngredientOption;
  queso: IngredientOption;
  extras: IngredientOption[];
  cantidad: number;
  precioUnitario: number;
  totalItem: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Cart state signals
  public readonly cart = signal<CartItem[]>([]);
  public readonly orderCounter = signal<number>(1);
  
  // Navigation & Flow state signals
  public readonly activeModal = signal<'none' | 'size' | 'ingredients' | 'success'>('none');
  public readonly customizingPizza = signal<Pizza | null>(null);
  public readonly selectedSize = signal<SizeOption | null>(null);
  
  // Last confirmed order details for success screen & ticket printing
  public readonly lastConfirmedOrder = signal<CartItem[]>([]);
  public readonly lastConfirmedOrderNumber = signal<string>('');
  public readonly lastConfirmedOrderTime = signal<string>('');
  public readonly lastConfirmedOrderTotal = signal<number>(0);

  // Constants
  public readonly SIZES: SizeOption[] = [
    { nombre: 'Chica', medida: '8" - 4 rebanadas', precio: 99 },
    { nombre: 'Mediana', medida: '12" - 8 rebanadas', precio: 149 },
    { nombre: 'Grande', medida: '16" - 12 rebanadas', precio: 199 }
  ];

  public readonly MASAS: IngredientOption[] = [
    { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
    { nombre: 'Delgada', precio: 0, categoria: 'masa' },
    { nombre: 'Gruesa', precio: 10, categoria: 'masa' },
    { nombre: 'Orilla Rellena de Queso', precio: 25, categoria: 'masa' }
  ];

  public readonly SALSAS: IngredientOption[] = [
    { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
    { nombre: 'BBQ', precio: 10, categoria: 'salsa' },
    { nombre: 'Alfredo', precio: 15, categoria: 'salsa' },
    { nombre: 'Pesto', precio: 15, categoria: 'salsa' }
  ];

  public readonly QUESOS: IngredientOption[] = [
    { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
    { nombre: 'Cheddar', precio: 10, categoria: 'queso' },
    { nombre: 'Parmesano', precio: 10, categoria: 'queso' },
    { nombre: 'Mezcla de 3 Quesos', precio: 20, categoria: 'queso' }
  ];

  public readonly EXTRAS: IngredientOption[] = [
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

  // Computed signals
  public readonly totalCart = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.totalItem, 0);
  });

  public readonly totalItemsCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.cantidad, 0);
  });

  // Flow control methods
  public openSizeModal(pizza: Pizza): void {
    this.customizingPizza.set(pizza);
    this.selectedSize.set(null);
    this.activeModal.set('size');
  }

  public selectSize(size: SizeOption): void {
    this.selectedSize.set(size);
    this.activeModal.set('ingredients');
  }

  public closeModal(): void {
    this.activeModal.set('none');
    this.customizingPizza.set(null);
    this.selectedSize.set(null);
  }

  // Cart operations
  public addToCart(itemDetails: Omit<CartItem, 'id' | 'cantidad' | 'totalItem'>): void {
    const currentCart = this.cart();
    
    // Check if an item with EXACTLY the same customizations already exists in the cart
    const existingIndex = currentCart.findIndex(item => {
      const matchPizza = item.pizza.id === itemDetails.pizza.id;
      const matchSize = item.size.nombre === itemDetails.size.nombre;
      const matchMasa = item.masa.nombre === itemDetails.masa.nombre;
      const matchSalsa = item.salsa.nombre === itemDetails.salsa.nombre;
      const matchQueso = item.queso.nombre === itemDetails.queso.nombre;
      
      // Compare extras (ignoring array order)
      const matchExtras = item.extras.length === itemDetails.extras.length &&
        item.extras.every(extra => itemDetails.extras.some(e => e.nombre === extra.nombre));
        
      return matchPizza && matchSize && matchMasa && matchSalsa && matchQueso && matchExtras;
    });

    if (existingIndex > -1) {
      // Incrementar cantidad
      const updatedCart = [...currentCart];
      const item = updatedCart[existingIndex];
      item.cantidad += 1;
      item.totalItem = item.cantidad * item.precioUnitario;
      this.cart.set(updatedCart);
    } else {
      // Agregar nuevo item
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const totalItem = itemDetails.precioUnitario;
      const newItem: CartItem = {
        ...itemDetails,
        id,
        cantidad: 1,
        totalItem
      };
      this.cart.set([...currentCart, newItem]);
    }
    
    this.closeModal();
  }

  public updateQuantity(itemId: string, delta: number): void {
    const currentCart = this.cart();
    const index = currentCart.findIndex(item => item.id === itemId);
    
    if (index === -1) return;
    
    const updatedCart = [...currentCart];
    const item = updatedCart[index];
    item.cantidad += delta;
    
    if (item.cantidad <= 0) {
      updatedCart.splice(index, 1);
    } else {
      item.totalItem = item.cantidad * item.precioUnitario;
    }
    
    this.cart.set(updatedCart);
  }

  public removeFromCart(itemId: string): void {
    this.cart.set(this.cart().filter(item => item.id !== itemId));
  }

  public confirmOrder(): void {
    if (this.cart().length === 0) return;
    
    // Store details of confirmed order
    const formattedOrderNumber = '#' + String(this.orderCounter()).padStart(4, '0');
    
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    // Translate date description to Spanish (e.g. 19 de mayo de 2026 a las 07:35 p.m.)
    const formattedTime = now.toLocaleDateString('es-ES', options)
      .replace(', ', ' a las ')
      .replace(' p. m.', ' p.m.')
      .replace(' a. m.', ' a.m.')
      .replace(' p. m.', ' p.m.')
      .replace(' a. m.', ' a.m.');
    
    this.lastConfirmedOrder.set(this.cart());
    this.lastConfirmedOrderNumber.set(formattedOrderNumber);
    this.lastConfirmedOrderTime.set(formattedTime);
    this.lastConfirmedOrderTotal.set(this.totalCart());
    
    // Increment order counter for next customer
    this.orderCounter.update(count => count + 1);
    
    // Reset cart and open order success modal
    this.cart.set([]);
    this.activeModal.set('success');
  }

  public resetFlow(): void {
    this.closeModal();
  }
}
