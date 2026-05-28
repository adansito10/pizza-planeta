import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Catalogo } from '../../components/catalogo/catalogo';
import { Promociones } from '../../components/promociones/promociones';
import { Carrito } from '../../components/carrito/carrito';
import { SeleccionTamano } from '../../components/modales/seleccion-tamano/seleccion-tamano';
import { SeleccionIngredientes } from '../../components/modales/seleccion-ingredientes/seleccion-ingredientes';
import { ConfirmacionOrden } from '../../components/modales/confirmacion-orden/confirmacion-orden';

@Component({
  selector: 'app-kiosk-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    Catalogo,
    Promociones,
    Carrito,
    SeleccionTamano,
    SeleccionIngredientes,
    ConfirmacionOrden
  ],
  templateUrl: './kiosk-layout.html',
  styleUrl: './kiosk-layout.scss'
})
export class KioskLayout {
  public readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  // Tab control
  public readonly activeTab = signal<'menu' | 'promos'>('menu');

  // Login Modal Control States
  public readonly showLoginModal = signal<boolean>(false);
  public username = '';
  public password = '';
  public readonly loginError = signal<string | null>(null);
  public readonly loginLoading = signal<boolean>(false);

  public setTab(tab: 'menu' | 'promos'): void {
    this.activeTab.set(tab);
  }

  public openLogin(): void {
    this.username = '';
    this.password = '';
    this.loginError.set(null);
    this.loginLoading.set(false);
    this.showLoginModal.set(true);
  }

  public closeLogin(): void {
    this.showLoginModal.set(false);
    this.username = '';
    this.password = '';
    this.loginError.set(null);
  }

  public onLoginSubmit(): void {
    this.loginError.set(null);

    if (!this.username.trim() || !this.password) {
      this.loginError.set('Por favor completa todos los campos.');
      return;
    }

    this.loginLoading.set(true);

    // Simulated short premium visual feedback
    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);
      this.loginLoading.set(false);

      if (success) {
        this.closeLogin();
        this.router.navigate(['/admin']);
      } else {
        this.loginError.set('Usuario o contraseña incorrectos.');
      }
    }, 850);
  }
}

