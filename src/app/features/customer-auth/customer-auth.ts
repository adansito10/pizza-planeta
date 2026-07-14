import { Component, inject, signal, AfterViewInit, OnInit } from '@angular/core';
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
export class CustomerAuthComponent implements OnInit, AfterViewInit {
  public readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Modal active mode: 'login' | 'register' | 'profile'
  public mode: 'login' | 'register' | 'profile' = 'login';

  // States
  public readonly loading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  // Form Fields
  public nombre = '';
  public apellido = '';
  public email = '';
  public confirmEmail = '';
  public telefono = '';
  public password = '';
  public recibePromos = true;

  public ngOnInit(): void {
    if (this.authService.isCustomerLoggedIn()) {
      this.cartService.activeModal.set('none');
      this.router.navigate(['/profile']);
      return;
    }
    this.mode = 'login';
  }

  public ngAfterViewInit(): void {
    if (this.mode === 'login') {
      this.renderGoogleButton();
    }
  }

  public setMode(newMode: 'login' | 'register' | 'profile'): void {
    this.mode = newMode;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    // Clear password when changing modes
    this.password = '';
    
    if (newMode === 'login') {
      this.renderGoogleButton();
    }
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
          const widthVal = btnEl.clientWidth || 320;
          const finalWidth = Math.min(Math.max(widthVal, 200), 400);
          google.accounts.id.renderButton(btnEl, {
            theme: 'outline',
            size: 'large',
            width: finalWidth,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        } catch (err) {
          console.error('Error initializing Google Sign-In:', err);
        }
      }
    }, 150);
  }

  public onSubmit(): void {
    if (this.mode === 'login') {
      this.handleLogin();
    } else if (this.mode === 'register') {
      this.handleRegister();
    } else if (this.mode === 'profile') {
      this.handleUpdateProfile();
    }
  }

  private handleLogin(): void {
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
      next: (res) => {
        this.loading.set(false);
        this.cartService.activeModal.set('none'); // Close modal
        if (res.user && (res.user.rol === 'admin' || res.user.email === 'adandejesus200420@gmail.com')) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/kiosk']);
        }
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión. Verifica tus datos.');
      }
    });
  }

  private handleRegister(): void {
    if (!this.nombre || !this.apellido || !this.email || !this.confirmEmail || !this.password) {
      this.errorMessage.set('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (this.email.trim().toLowerCase() !== this.confirmEmail.trim().toLowerCase()) {
      this.errorMessage.set('Las direcciones de correo electrónico no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.customerRegister(
      this.nombre.trim(),
      this.apellido.trim(),
      this.email.trim(),
      this.password,
      '', // No phone requested during registration
      this.recibePromos
    ).subscribe({
      next: () => {
        // Auto-login after successful registration
        this.authService.customerLogin(this.email.trim(), this.password).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.cartService.activeModal.set('none'); // Close modal
            if (res.user && (res.user.rol === 'admin' || res.user.email === 'adandejesus200420@gmail.com')) {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/kiosk']);
            }
          },
          error: (err) => {
            this.loading.set(false);
            this.mode = 'login';
            this.errorMessage.set('Registro exitoso. Por favor inicia sesión.');
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrarse. Intenta con otro correo.');
      }
    });
  }

  private handleUpdateProfile(): void {
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
        this.password = ''; // Clear password field
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar el perfil.');
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
        next: (res) => {
          this.loading.set(false);
          this.cartService.activeModal.set('none'); // Close modal
          if (res.user && (res.user.rol === 'admin' || res.user.email === 'adandejesus200420@gmail.com')) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/kiosk']);
          }
        },
        error: () => {
          // Auto registration on first login (with default empty values for surname/phone)
          this.authService.customerRegister(name, '', email, googleDummyPass, '', true).subscribe({
            next: () => {
              this.authService.customerLogin(email, googleDummyPass).subscribe({
                next: (res) => {
                  this.loading.set(false);
                  this.cartService.activeModal.set('none'); // Close modal
                  
                  // Redirect to profile page so they can complete the mandatory fields
                  this.router.navigate(['/profile']).then(() => {
                    // Open edit settings tab or show notice
                    alert('¡Bienvenido! Por favor completa tu apellido y número de teléfono para poder realizar pedidos.');
                  });
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

  public cerrarSesion(): void {
    this.authService.customerLogout();
    this.cartService.activeModal.set('none');
    this.router.navigate(['/kiosk']);
  }

  public volverAlMenu(): void {
    this.cartService.activeModal.set('none'); // Close modal overlay
  }
}
