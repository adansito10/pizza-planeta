import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../../../services/auth.service';
import { OrderService } from '../../../../services/order.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  public readonly themeService = inject(ThemeService);
  public readonly orderService = inject(OrderService);
  public readonly toastService = inject(ToastService);
  public readonly confirmService = inject(ConfirmService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/kiosk']);
  }


  public readonly menuItems = [
    {
      label: 'Dashboard',
      route: 'dashboard',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>`
    },
    {
      label: 'Pedidos',
      route: 'orders',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M8.25 21h8.25c1.242 0 2.25-1.008 2.25-2.25V5.25C18.75 4.008 17.742 3 16.5 3H7.5C6.258 3 5.25 4.008 5.25 5.25v13.5C5.25 19.992 6.258 21 7.5 21h.75z" />
      </svg>`
    },
    {
      label: 'Catálogo',
      route: 'catalog',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>`
    },
    {
      label: 'Usuarios',
      route: 'users',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.277-.624-6.041-1.713A4.123 4.123 0 001 20.738a9.337 9.337 0 004.121.952c1.077 0 2.115-.18 3.07-.508M9.3 12a3 3 0 100-6 3 3 0 000 6zm6-3a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>`
    }
  ];

  public get currentYear(): number {
    return new Date().getFullYear();
  }
}
