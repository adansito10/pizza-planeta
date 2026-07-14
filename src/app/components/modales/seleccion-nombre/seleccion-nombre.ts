import { Component, inject, OnInit } from '@angular/core';
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

    // If logged in and phone was empty in profile, save it to their profile database record
    const customer = this.authService.customerUser();
    if (customer && !customer.telefono && finalTelefono) {
      this.authService.customerUpdateProfile(
        customer.id,
        customer.nombre,
        customer.apellido || '',
        customer.email,
        finalTelefono,
        customer.recibePromos || false
      ).subscribe({
        next: () => {
          console.log('Phone number successfully updated in customer profile.');
        },
        error: (err) => {
          console.error('Error auto-updating customer phone number:', err);
        }
      });
    }

    // Execute order placement using MercadoPago
    this.cartService.confirmOrder(finalNombre, 'MercadoPago');
    
    this.nombre = '';
    this.telefono = '';
  }
}
