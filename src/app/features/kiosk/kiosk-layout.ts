import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Catalogo } from '../../components/catalogo/catalogo';
import { Promociones } from '../../components/promociones/promociones';
import { Carrito } from '../../components/carrito/carrito';
import { SeleccionTamano } from '../../components/modales/seleccion-tamano/seleccion-tamano';
import { SeleccionIngredientes } from '../../components/modales/seleccion-ingredientes/seleccion-ingredientes';
import { SeleccionNombre } from '../../components/modales/seleccion-nombre/seleccion-nombre';
import { MetodoPago } from '../../components/modales/metodo-pago/metodo-pago';
import { ConfirmacionOrden } from '../../components/modales/confirmacion-orden/confirmacion-orden';
import { CustomerAuthComponent } from '../customer-auth/customer-auth';
import { Sucursal } from '../../components/sucursal/sucursal';

@Component({
  selector: 'app-kiosk-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Catalogo,
    Promociones,
    Carrito,
    SeleccionTamano,
    SeleccionIngredientes,
    SeleccionNombre,
    MetodoPago,
    ConfirmacionOrden,
    CustomerAuthComponent,
    Sucursal
  ],
  templateUrl: './kiosk-layout.html',
  styleUrl: './kiosk-layout.scss'
})
export class KioskLayout implements OnInit, OnDestroy {
  public readonly cartService = inject(CartService);
  public readonly authService = inject(AuthService);
  public readonly router = inject(Router);

  private titleInterval: any;
  public readonly alternateTitle = signal<boolean>(false);

  public ngOnInit(): void {
    this.titleInterval = setInterval(() => {
      this.alternateTitle.update(val => !val);
    }, 5000); // Changes every 5 seconds
  }

  public ngOnDestroy(): void {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
    }
  }

  public irALogin(): void {
    if (this.authService.isCustomerLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.cartService.activeModal.set('customerAuth');
    }
  }

  public cerrarSesionCliente(): void {
    this.authService.customerLogout();
  }
  
  // Tab control
  public readonly activeTab = signal<'menu' | 'promos' | 'sucursal'>('menu');

  // Privacy Modal Control State
  public readonly showPrivacyModal = signal<boolean>(false);

  public openPrivacyModal(): void {
    this.showPrivacyModal.set(true);
  }

  public closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
  }

  public setTab(tab: 'menu' | 'promos' | 'sucursal'): void {
    this.activeTab.set(tab);
  }

  public onLogoClick(): void {
    // Return to menu
    this.router.navigate(['/kiosk']);
  }
}

