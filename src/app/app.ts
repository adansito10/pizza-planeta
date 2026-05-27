import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { Catalogo } from './components/catalogo/catalogo';
import { Promociones } from './components/promociones/promociones';
import { Carrito } from './components/carrito/carrito';
import { SeleccionTamano } from './components/modales/seleccion-tamano/seleccion-tamano';
import { SeleccionIngredientes } from './components/modales/seleccion-ingredientes/seleccion-ingredientes';
import { ConfirmacionOrden } from './components/modales/confirmacion-orden/confirmacion-orden';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Catalogo,
    Promociones,
    Carrito,
    SeleccionTamano,
    SeleccionIngredientes,
    ConfirmacionOrden
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public readonly cartService = inject(CartService);
  
  // Tab control
  public readonly activeTab = signal<'menu' | 'promos'>('menu');

  public setTab(tab: 'menu' | 'promos'): void {
    this.activeTab.set(tab);
  }
}
