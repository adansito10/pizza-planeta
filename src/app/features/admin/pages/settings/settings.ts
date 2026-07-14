import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { OrderService } from '../../../../services/order.service';
import { ProductService } from '../../../../services/product.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {
  public readonly themeService = inject(ThemeService);
  public readonly orderService = inject(OrderService);
  public readonly productService = inject(ProductService);
  public readonly toastService = inject(ToastService);
  public readonly confirmService = inject(ConfirmService);


  public generateTestOrder(): void {
    const pizzas = this.productService.pizzas();
    if (pizzas.length === 0) {
      this.toastService.show('Error', 'No hay pizzas en el catálogo para generar un pedido de prueba.', 'error');
      return;
    }

    // Select 1-2 random pizzas
    const count = Math.floor(Math.random() * 2) + 1;
    const items = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const pizza = pizzas[Math.floor(Math.random() * pizzas.length)];
      const size = { nombre: 'Grande', medida: '16"', precio: 199 };
      const itemPrice = pizza.precioBase;
      
      items.push({
        id: 'test-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        pizza,
        cantidad: 1,
        precioUnitario: itemPrice,
        totalItem: itemPrice,
        size,
        masa: { nombre: 'Tradicional', precio: 0, categoria: 'masa' as const },
        salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' as const },
        queso: { nombre: 'Mozzarella', precio: 0, categoria: 'queso' as const },
        extras: []
      });
      total += itemPrice;
    }

    this.orderService.addOrder(items, total).subscribe({
      next: (newOrder) => {
        this.toastService.show('Pedido Generado', `Se generó la orden de prueba ${newOrder.orderNumber}.`, 'success');
      },
      error: (err) => {
        this.toastService.show('Error', 'No se pudo generar la orden de prueba.', 'error');
      }
    });
  }

  public resetEverything(): void {
    this.confirmService.ask({
      title: 'Restablecer Todo',
      message: '¿Estás seguro de que deseas restablecer todos los datos (pedidos y catálogo)? Esta acción no se puede deshacer.',
      confirmText: 'Restablecer',
      onConfirm: () => {
        this.orderService.clearAllOrders();
        this.productService.resetCatalog();
      }
    });
  }
}
