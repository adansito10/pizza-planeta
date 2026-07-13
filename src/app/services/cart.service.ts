import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';

export interface Pizza {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioBase: number;
  defaultMasa?: string;
  defaultSalsa?: string;
  defaultQueso?: string;
  defaultExtras?: string[];
}

export interface Promo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  pizzaBase: Pizza;
  badge: string;
  pizzaBaseId?: string;
}


export interface SizeOption {
  id?: string;
  nombre: string;
  medida: string;
  precio: number;
}

export interface IngredientOption {
  id?: string;
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
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  
  // Cart state signals
  public readonly cart = signal<CartItem[]>([]);
  public readonly orderCounter = signal<number>(1);
  
  // Navigation & Flow state signals
  public readonly activeModal = signal<string>('none');
  public readonly customizingPizza = signal<Pizza | null>(null);
  public readonly customizingPromo = signal<Promo | null>(null);
  public readonly selectedSize = signal<SizeOption | null>(null);
  public readonly showCart = signal<boolean>(false);
  
  // Last confirmed order details for success screen & ticket printing
  public readonly lastConfirmedOrder = signal<CartItem[]>([]);
  public readonly lastConfirmedOrderNumber = signal<string>('');
  public readonly lastConfirmedOrderTime = signal<string>('');
  public readonly lastConfirmedOrderTotal = signal<number>(0);
  public readonly lastConfirmedOrderName = signal<string>('');
  public readonly lastConfirmedOrderPickupCode = signal<string>('');

  // Payment states
  public readonly tempCustomerName = signal<string>('');
  public readonly isProcessingPayment = signal<boolean>(false);

  // Getters reading from ProductService dynamically
  public get SIZES(): SizeOption[] {
    return this.productService.sizes();
  }

  public get MASAS(): IngredientOption[] {
    return this.productService.ingredients().filter(i => i.categoria === 'masa');
  }

  public get SALSAS(): IngredientOption[] {
    return this.productService.ingredients().filter(i => i.categoria === 'salsa');
  }

  public get QUESOS(): IngredientOption[] {
    return this.productService.ingredients().filter(i => i.categoria === 'queso');
  }

  public get EXTRAS(): IngredientOption[] {
    return this.productService.ingredients().filter(i => i.categoria === 'extra');
  }


  // Computed signals
  public readonly totalCart = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.totalItem, 0);
  });

  public readonly totalItemsCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.cantidad, 0);
  });

  // Flow control methods
  public openSizeModal(pizza: Pizza): void {
    this.customizingPromo.set(null);
    this.customizingPizza.set(pizza);
    this.selectedSize.set(null);
    this.activeModal.set('size');
  }

  public openPromoModal(promo: Promo): void {
    this.customizingPromo.set(promo);
    this.customizingPizza.set(promo.pizzaBase);

    // Auto-detect the size from the promo title/description
    let sizeName = 'Mediana'; // default fallback
    const lowerNombre = promo.nombre.toLowerCase();
    const lowerDesc = promo.descripcion.toLowerCase();
    if (lowerNombre.includes('familiar') || lowerNombre.includes('grande') || lowerDesc.includes('familiar') || lowerDesc.includes('grande')) {
      sizeName = 'Familiar';
    } else if (lowerNombre.includes('personal') || lowerNombre.includes('chica') || lowerDesc.includes('personal') || lowerDesc.includes('chica')) {
      sizeName = 'Personal';
    } else if (lowerNombre.includes('mediana') || lowerDesc.includes('mediana')) {
      sizeName = 'Mediana';
    }

    const matchedSize = this.SIZES.find(s => s.nombre.toLowerCase() === sizeName.toLowerCase()) || this.SIZES[0];
    this.selectedSize.set(matchedSize);
    
    // Bypass size selection, go straight to ingredients customization
    this.activeModal.set('ingredients');
  }

  public selectSize(size: SizeOption): void {
    this.selectedSize.set(size);
    this.activeModal.set('ingredients');
  }

  public closeModal(): void {
    this.activeModal.set('none');
    this.customizingPizza.set(null);
    this.customizingPromo.set(null);
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
    this.showCart.set(true);
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

  public confirmOrder(clienteNombre: string, metodoPago: 'Efectivo' | 'MercadoPago'): void {
    if (this.cart().length === 0) return;
    
    this.isProcessingPayment.set(true);
    
    const customer = this.authService.customerUser();
    const userId = customer ? customer.id : null;
    
    // Register the order via OrderService
    this.orderService.addOrder(this.cart(), this.totalCart(), clienteNombre, userId).subscribe({
      next: (newOrder) => {
        if (metodoPago === 'Efectivo') {
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          };
          const formattedTime = now.toLocaleDateString('es-ES', options)
            .replace(', ', ' a las ')
            .replace(' p. m.', ' p.m.')
            .replace(' a. m.', ' a.m.')
            .replace(' p. m.', ' p.m.')
            .replace(' a. m.', ' a.m.');
          
          this.lastConfirmedOrder.set(newOrder.items);
          this.lastConfirmedOrderNumber.set(newOrder.orderNumber);
          this.lastConfirmedOrderTime.set(formattedTime);
          this.lastConfirmedOrderTotal.set(newOrder.total);
          this.lastConfirmedOrderName.set(newOrder.clienteNombre || clienteNombre);
          this.lastConfirmedOrderPickupCode.set(newOrder.pickupCode || '');
          
          // Reset cart and open order success modal
          this.cart.set([]);
          this.activeModal.set('success');
          this.showCart.set(false);
          this.isProcessingPayment.set(false);
        } else {
          // Mercado Pago payment option selected
          this.http.post<{ initPoint: string }>('http://localhost:3000/api/payments/create-preference', { orderId: newOrder.id }).subscribe({
            next: (paymentRes) => {
              this.cart.set([]); // Clear cart
              this.closeModal();
              this.isProcessingPayment.set(false);
              // Redirect customer to Mercado Pago checkout
              window.location.href = paymentRes.initPoint;
            },
            error: (err) => {
              console.error('Error al generar preferencia de Mercado Pago', err);
              alert('Hubo un error al iniciar Mercado Pago. Por favor realiza tu pago en caja (Efectivo).');
              this.isProcessingPayment.set(false);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al registrar la orden en el servidor', err);
        this.isProcessingPayment.set(false);
      }
    });
  }

  public resetFlow(): void {
    this.closeModal();
  }
}
