import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seleccion-nombre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccion-nombre.html',
  styleUrl: './seleccion-nombre.scss'
})
export class SeleccionNombre implements OnInit {
  public readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  
  public nombre = '';
  public telefono = '';

  constructor() {
    effect(() => {
      const activeModal = this.cartService.activeModal();
      if (activeModal === 'name') {
        const customer = this.authService.customerUser();
        if (customer) {
          this.nombre = `${customer.nombre || ''} ${customer.apellido || ''}`.trim();
          this.telefono = customer.telefono || '';
        }
      }
    });
  }

  public ngOnInit(): void {
    const customer = this.authService.customerUser();
    if (customer) {
      this.nombre = `${customer.nombre || ''} ${customer.apellido || ''}`.trim();
      this.telefono = customer.telefono || '';
    }
  }

  public close(): void {
    this.cartService.closeModal();
    this.nombre = '';
    this.telefono = '';
  }

  public confirmar(): void {
    if (!this.nombre.trim() || !this.telefono.trim()) {
      alert('Por favor ingresa tu nombre y número de teléfono para continuar.');
      return;
    }
    
    const finalNombre = this.nombre.trim();
    const finalTelefono = this.telefono.trim();

    this.cartService.tempCustomerName.set(finalNombre);
    this.cartService.tempCustomerPhone.set(finalTelefono);

    // If logged in, check if name or phone changed and update database profile
    const customer = this.authService.customerUser();
    if (customer) {
      const nameParts = finalNombre.split(' ');
      const newNombre = nameParts[0] || '';
      const newApellido = nameParts.slice(1).join(' ');
      
      const hasNameChanged = (newNombre !== customer.nombre) || (newApellido !== (customer.apellido || ''));
      const hasPhoneChanged = finalTelefono !== customer.telefono;

      if (hasNameChanged || hasPhoneChanged) {
        this.authService.customerUpdateProfile(
          customer.id,
          newNombre,
          newApellido,
          customer.email,
          finalTelefono,
          customer.recibePromos || false
        ).subscribe({
          next: () => {
            console.log('Customer profile auto-updated successfully.');
          },
          error: (err) => {
            console.error('Error auto-updating customer profile:', err);
          }
        });
      }
    }

    // Execute order placement using MercadoPago
    this.cartService.confirmOrder(finalNombre, 'MercadoPago');
    
    this.nombre = '';
    this.telefono = '';
  }
}
