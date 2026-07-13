import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

declare var google: any;

@Component({
  selector: 'app-customer-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-auth.html',
  styleUrl: './customer-auth.scss'
})
export class CustomerAuthComponent implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // States
  public readonly loading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  // Form Fields
  public email = '';
  public password = '';

  public ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  public renderGoogleButton(): void {
    setTimeout(() => {
      const btnEl = document.getElementById('google-btn');
      if (btnEl && typeof google !== 'undefined') {
        try {
          google.accounts.id.initialize({
            client_id: '879718315293-mujlou621pv9vcmki392to2lvkhauda1.apps.googleusercontent.com',
            callback: this.handleCredentialResponse.bind(this)
          });
          google.accounts.id.renderButton(btnEl, {
            theme: 'outline',
            size: 'large',
            width: btnEl.clientWidth || 380,
            text: 'signin_with'
          });
        } catch (err) {
          console.error('Error initializing Google Sign-In:', err);
        }
      }
    }, 150);
  }

  public onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // Direct Admin check
    if ((this.email.trim() === 'admin' || this.email.trim() === 'admin@pizzeria.com') && this.password === 'admin123') {
      setTimeout(() => {
        const success = this.authService.login('admin', this.password);
        this.loading.set(false);
        if (success) {
          this.cartService.activeModal.set('none'); // Close modal
          this.router.navigate(['/admin/dashboard']); // Redirect to admin panel
        } else {
          this.errorMessage.set('Usuario o contraseña de administrador incorrectos.');
        }
      }, 500);
      return;
    }

    // Customer Login flow
    this.authService.customerLogin(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.cartService.activeModal.set('none'); // Close modal
        this.router.navigate(['/kiosk']);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión. Verifica tus datos.');
      }
    });
  }

  public handleCredentialResponse(response: any): void {
    if (!response || !response.credential) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      // Decode JWT token payload (base64)
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const email = payload.email;
      const name = payload.name;
      const googleDummyPass = 'google-oauth-dummy-secret-key';

      // Login or register dynamically
      this.authService.customerLogin(email, googleDummyPass).subscribe({
        next: () => {
          this.loading.set(false);
          this.cartService.activeModal.set('none'); // Close modal
          this.router.navigate(['/kiosk']);
        },
        error: () => {
          // Auto registration on first login
          this.authService.customerRegister(name, email, googleDummyPass).subscribe({
            next: () => {
              this.authService.customerLogin(email, googleDummyPass).subscribe({
                next: () => {
                  this.loading.set(false);
                  this.cartService.activeModal.set('none'); // Close modal
                  this.router.navigate(['/kiosk']);
                },
                error: (err) => {
                  this.loading.set(false);
                  this.errorMessage.set('Error al iniciar sesión tras registro de Google.');
                }
              });
            },
            error: (err) => {
              this.loading.set(false);
              this.errorMessage.set('Error al registrar usuario de Google.');
            }
          });
        }
      });
    } catch (err) {
      console.error('Error decoding Google response:', err);
      this.loading.set(false);
      this.errorMessage.set('Error al procesar la autenticación de Google.');
    }
  }

  public volverAlMenu(): void {
    this.cartService.activeModal.set('none'); // Close modal overlay
  }
}
