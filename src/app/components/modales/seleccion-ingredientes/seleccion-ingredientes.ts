import { Component, inject, signal, computed, effect } from '@angular/core';
import { CartService, IngredientOption, CartItem } from '../../../services/cart.service';

@Component({
  selector: 'app-seleccion-ingredientes',
  standalone: true,
  imports: [],
  templateUrl: './seleccion-ingredientes.html',
  styleUrl: './seleccion-ingredientes.scss'
})
export class SeleccionIngredientes {
  public readonly cartService = inject(CartService);

  // Selection signals
  public readonly selectedMasa = signal<IngredientOption>(this.cartService.MASAS[0]);
  public readonly selectedSalsa = signal<IngredientOption>(this.cartService.SALSAS[0]);
  public readonly selectedQueso = signal<IngredientOption>(this.cartService.QUESOS[0]);
  public readonly selectedExtras = signal<IngredientOption[]>([]);

  // Reactively reset choices when customizing a new pizza
  constructor() {
    effect(() => {
      const pizza = this.cartService.customizingPizza();
      const size = this.cartService.selectedSize();
      if (pizza && size) {
        this.selectedMasa.set(this.cartService.MASAS[0]);
        this.selectedSalsa.set(this.cartService.SALSAS[0]);
        this.selectedQueso.set(this.cartService.QUESOS[0]);
        this.selectedExtras.set([]);
      }
    });
  }

  // Real-time calculated price
  public readonly currentUnitPrice = computed(() => {
    const sizePrice = this.cartService.selectedSize()?.precio || 0;
    const masaPrice = this.selectedMasa().precio;
    const salsaPrice = this.selectedSalsa().precio;
    const quesoPrice = this.selectedQueso().precio;
    const extrasPrice = this.selectedExtras().reduce((sum, extra) => sum + extra.precio, 0);

    return sizePrice + masaPrice + salsaPrice + quesoPrice + extrasPrice;
  });

  // Selection handlers
  public selectMasa(masa: IngredientOption): void {
    this.selectedMasa.set(masa);
  }

  public selectSalsa(salsa: IngredientOption): void {
    this.selectedSalsa.set(salsa);
  }

  public selectQueso(queso: IngredientOption): void {
    this.selectedQueso.set(queso);
  }

  public toggleExtra(extra: IngredientOption): void {
    const current = this.selectedExtras();
    const exists = current.some(e => e.nombre === extra.nombre);
    
    if (exists) {
      this.selectedExtras.set(current.filter(e => e.nombre !== extra.nombre));
    } else {
      this.selectedExtras.set([...current, extra]);
    }
  }

  public isExtraSelected(extra: IngredientOption): boolean {
    return this.selectedExtras().some(e => e.nombre === extra.nombre);
  }

  // Action methods
  public cancelar(): void {
    this.cartService.closeModal();
  }

  public agregarAlCarrito(): void {
    const pizza = this.cartService.customizingPizza();
    const size = this.cartService.selectedSize();
    
    if (!pizza || !size) return;

    this.cartService.addToCart({
      pizza,
      size,
      masa: this.selectedMasa(),
      salsa: this.selectedSalsa(),
      queso: this.selectedQueso(),
      extras: this.selectedExtras(),
      precioUnitario: this.currentUnitPrice()
    });
  }
}
