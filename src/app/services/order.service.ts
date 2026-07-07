import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem } from './cart.service';

export type OrderStatus = 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  time: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/orders';

  // State signals
  public readonly orders = signal<Order[]>([]);
  public readonly orderCounter = signal<number>(1);

  constructor() {
    this.loadFromBackend();
  }

  // Computed signals for Dashboard KPIs
  public readonly activeOrders = computed(() => {
    return this.orders().filter(o => o.status !== 'Entregado');
  });

  public readonly completedOrders = computed(() => {
    return this.orders().filter(o => o.status === 'Entregado');
  });

  public readonly totalSales = computed(() => {
    return this.orders()
      .filter(o => o.status === 'Entregado')
      .reduce((sum, o) => sum + o.total, 0);
  });

  public readonly averageOrderValue = computed(() => {
    const completed = this.completedOrders();
    if (completed.length === 0) return 0;
    return this.totalSales() / completed.length;
  });

  public readonly topSellingPizzas = computed(() => {
    const counts: { [name: string]: number } = {};
    this.orders().forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.pizza && item.pizza.nombre) {
            const name = item.pizza.nombre;
            counts[name] = (counts[name] || 0) + item.cantidad;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  });

  // Actions
  public addOrder(items: CartItem[], total: number): Observable<Order> {
    const payload = { items, total };
    return this.http.post<Order>(this.apiUrl, payload).pipe(
      tap((newOrder) => {
        this.orders.update(current => [newOrder, ...current]);
        this.orderCounter.set(this.orderCounter() + 1);
      })
    );
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): void {
    this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status }).subscribe({
      next: (updatedOrder) => {
        this.orders.update(current => current.map(order => 
          order.id === orderId ? { ...order, status: updatedOrder.status } : order
        ));
      },
      error: (err) => console.error('Error al actualizar el estado del pedido', err)
    });
  }

  public deleteOrder(orderId: string): void {
    this.http.delete(`${this.apiUrl}/${orderId}`).subscribe({
      next: () => {
        this.orders.update(current => current.filter(o => o.id !== orderId));
      },
      error: (err) => console.error('Error al eliminar el pedido', err)
    });
  }

  public clearAllOrders(): void {
    this.http.post(`${this.apiUrl}/clear`, {}).subscribe({
      next: () => {
        this.orders.set([]);
        this.orderCounter.set(1);
      },
      error: (err) => console.error('Error al limpiar los pedidos', err)
    });
  }

  private loadFromBackend(): void {
    this.http.get<Order[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.orders.set(data);
        if (data.length > 0) {
          // Ajustar el contador de pedidos al máximo número existente + 1
          const maxNum = data.reduce((max, order) => {
            const num = parseInt(order.orderNumber.replace('#', ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
          }, 0);
          this.orderCounter.set(maxNum + 1);
        } else {
          this.orderCounter.set(1);
        }
      },
      error: (err) => console.error('Error al leer pedidos de la API', err)
    });
  }
}
