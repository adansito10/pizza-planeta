import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order, OrderStatus } from '../../../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent {
  public readonly orderService = inject(OrderService);

  // Modal / Detail state signals
  public readonly selectedOrder = signal<Order | null>(null);

  // Filter columns
  public getPendingOrders(): Order[] {
    return this.orderService.orders().filter(o => o.status === 'Pendiente');
  }

  public getPreparingOrders(): Order[] {
    return this.orderService.orders().filter(o => o.status === 'Preparando');
  }

  public getReadyOrders(): Order[] {
    return this.orderService.orders().filter(o => o.status === 'Listo');
  }

  public getDeliveredOrders(): Order[] {
    return this.orderService.orders().filter(o => o.status === 'Entregado');
  }

  public selectOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  public closeDetails(): void {
    this.selectedOrder.set(null);
  }

  public advanceStatus(order: Order): void {
    let nextStatus: OrderStatus = order.status;
    if (order.status === 'Pendiente') nextStatus = 'Preparando';
    else if (order.status === 'Preparando') nextStatus = 'Listo';
    else if (order.status === 'Listo') nextStatus = 'Entregado';

    this.orderService.updateOrderStatus(order.id, nextStatus);
    
    // Update active selected order if open
    const currentSelected = this.selectedOrder();
    if (currentSelected && currentSelected.id === order.id) {
      this.selectedOrder.set({ ...currentSelected, status: nextStatus });
    }
  }

  public cancelOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      this.orderService.deleteOrder(orderId);
      this.closeDetails();
    }
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
