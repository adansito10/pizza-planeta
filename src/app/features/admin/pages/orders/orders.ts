import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderStatus } from '../../../../services/order.service';
import { ConfirmService } from '../../../../services/confirm.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent {
  public readonly orderService = inject(OrderService);
  public readonly confirmService = inject(ConfirmService);

  // Search filter query
  public readonly searchQuery = signal<string>('');

  // Modal / Detail state signals
  public readonly selectedOrder = signal<Order | null>(null);

  // View mode signal: 'cajero' (shows all) or 'cocina' (hides pending & finances)
  public readonly viewMode = signal<'cajero' | 'cocina'>('cajero');

  public setViewMode(mode: 'cajero' | 'cocina'): void {
    this.viewMode.set(mode);
  }

  // Helper method to filter orders based on the search query
  private filterQuery(orders: Order[]): Order[] {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(o => 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
      (o.clienteNombre && o.clienteNombre.toLowerCase().includes(query)) ||
      (o.pickupCode && o.pickupCode.toLowerCase().includes(query))
    );
  }

  // Filter columns
  public getPendingOrders(): Order[] {
    return this.filterQuery(this.orderService.orders().filter(o => o.status === 'Pendiente' && o.paymentStatus !== 'approved' && !o.preferenceId));
  }

  public getPaidOrders(): Order[] {
    return this.filterQuery(this.orderService.orders().filter(o => o.status === 'Pendiente' && o.paymentStatus === 'approved'));
  }

  public getPreparingOrders(): Order[] {
    return this.filterQuery(this.orderService.orders().filter(o => o.status === 'Preparando'));
  }

  public getReadyOrders(): Order[] {
    return this.filterQuery(this.orderService.orders().filter(o => o.status === 'Listo'));
  }

  public getDeliveredOrders(): Order[] {
    return this.filterQuery(this.orderService.orders().filter(o => o.status === 'Entregado'));
  }

  public selectOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  public closeDetails(): void {
    this.selectedOrder.set(null);
  }

  public advanceStatus(order: Order): void {
    if (order.status === 'Pendiente') {
      if (order.paymentStatus !== 'approved') {
        this.orderService.confirmOrderPayment(order.id).subscribe({
          next: (updatedOrder) => {
            // Update selected order details if open
            const currentSelected = this.selectedOrder();
            if (currentSelected && currentSelected.id === order.id) {
              this.selectedOrder.set(updatedOrder);
            }
          },
          error: (err) => console.error('Error al confirmar pago en caja', err)
        });
      } else {
        this.orderService.updateOrderStatus(order.id, 'Preparando');
        // Update active selected order if open
        const currentSelected = this.selectedOrder();
        if (currentSelected && currentSelected.id === order.id) {
          this.selectedOrder.set({ ...currentSelected, status: 'Preparando' });
        }
      }
      return;
    }

    let nextStatus: OrderStatus = order.status;
    if (order.status === 'Preparando') nextStatus = 'Listo';
    else if (order.status === 'Listo') nextStatus = 'Entregado';

    this.orderService.updateOrderStatus(order.id, nextStatus);
    
    // Update active selected order if open
    const currentSelected = this.selectedOrder();
    if (currentSelected && currentSelected.id === order.id) {
      this.selectedOrder.set({ ...currentSelected, status: nextStatus });
    }
  }

  public cancelOrder(orderId: string): void {
    this.confirmService.ask({
      title: 'Cancelar Pedido',
      message: '¿Estás seguro de que deseas cancelar este pedido? Esta acción es irreversible.',
      confirmText: 'Cancelar',
      onConfirm: () => {
        this.orderService.deleteOrder(orderId);
        this.closeDetails();
      }
    });
  }

  public printTicket(order: Order): void {
    // Set the print details and open standard browser print window.
    // The print style sheet in styles.css will handle making only the ticket print.
    this.selectedOrder.set(order);
    
    // We delay the print function slightly to ensure DOM is rendered before triggering.
    setTimeout(() => {
      window.print();
    }, 150);
  }
}
