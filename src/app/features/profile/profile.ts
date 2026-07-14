import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Tab State: 'resumen' | 'configuracion'
  public activeTab: 'resumen' | 'configuracion' = 'resumen';

  // Form States
  public readonly loading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  // Form Fields
  public nombre = '';
  public apellido = '';
  public email = '';
  public telefono = '';
  public password = '';
  public recibePromos = true;

  public ngOnInit(): void {
    if (!this.authService.isCustomerLoggedIn()) {
      this.router.navigate(['/kiosk']);
      // Proactively open login modal
      this.cartService.activeModal.set('customerAuth');
      return;
    }

    this.prefillForm();
  }

  public setTab(tab: 'resumen' | 'configuracion'): void {
    this.activeTab = tab;
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private prefillForm(): void {
    const user = this.authService.customerUser();
    if (user) {
      this.nombre = user.nombre || '';
      this.apellido = user.apellido || '';
      this.email = user.email || '';
      this.telefono = user.telefono || '';
      this.recibePromos = user.recibePromos !== undefined ? user.recibePromos : true;
    }
  }

  public onSubmit(): void {
    const user = this.authService.customerUser();
    if (!user) return;

    if (!this.nombre || !this.apellido || !this.email || !this.telefono) {
      this.errorMessage.set('Nombre, Apellido, Correo y Teléfono son requeridos.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.customerUpdateProfile(
      user.id,
      this.nombre.trim(),
      this.apellido.trim(),
      this.email.trim(),
      this.telefono.trim(),
      this.recibePromos,
      this.password ? this.password : undefined
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Perfil actualizado correctamente.');
        this.password = ''; // Clear password field after save
        this.prefillForm(); // Sync fields
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar el perfil.');
      }
    });
  }

  public cerrarSesion(): void {
    this.authService.customerLogout();
    this.router.navigate(['/kiosk']);
  }

  public volverAlKiosk(): void {
    this.router.navigate(['/kiosk']);
  }
}
