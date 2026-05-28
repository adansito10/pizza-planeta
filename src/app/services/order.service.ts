import { Injectable, signal, computed } from '@angular/core';
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
  private readonly STORAGE_KEY = 'planet_pizza_orders';
  private readonly COUNTER_KEY = 'planet_pizza_order_counter';

  // State signals
  public readonly orders = signal<Order[]>([]);
  public readonly orderCounter = signal<number>(1);

  constructor() {
    this.loadFromStorage();
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
      order.items.forEach(item => {
        const name = item.pizza.nombre;
        counts[name] = (counts[name] || 0) + item.cantidad;
      });
    });
    return Object.entries(counts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  });

  // Actions
  public addOrder(items: CartItem[], total: number): Order {
    const currentCounter = this.orderCounter();
    const orderNumber = '#' + String(currentCounter).padStart(4, '0');
    
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const time = now.toLocaleTimeString('es-ES', options);

    const newOrder: Order = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      orderNumber,
      items: [...items],
      total,
      status: 'Pendiente',
      time,
      timestamp: now.getTime()
    };

    const updatedOrders = [newOrder, ...this.orders()];
    this.orders.set(updatedOrders);
    this.orderCounter.set(currentCounter + 1);
    
    this.saveToStorage();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): void {
    const updated = this.orders().map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });
    this.orders.set(updated);
    this.saveToStorage();
  }

  public deleteOrder(orderId: string): void {
    const filtered = this.orders().filter(o => o.id !== orderId);
    this.orders.set(filtered);
    this.saveToStorage();
  }

  public clearAllOrders(): void {
    this.orders.set([]);
    this.orderCounter.set(1);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
    this.initializeMockData();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders()));
      localStorage.setItem(this.COUNTER_KEY, String(this.orderCounter()));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const storedOrders = localStorage.getItem(this.STORAGE_KEY);
      const storedCounter = localStorage.getItem(this.COUNTER_KEY);

      if (storedOrders) {
        this.orders.set(JSON.parse(storedOrders));
      } else {
        this.initializeMockData();
      }

      if (storedCounter) {
        this.orderCounter.set(Number(storedCounter));
      } else if (!storedOrders) {
        this.orderCounter.set(5); // Start after mocks
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
      this.initializeMockData();
    }
  }

  private initializeMockData(): void {
    // Generate some mock orders so dashboard doesn't start empty
    const mockPizzas = [
      { id: 'pepperoni', nombre: 'Pepperoni', descripcion: '', imagen: '', precioBase: 199 },
      { id: 'hawaiana', nombre: 'Hawaiana', descripcion: '', imagen: '', precioBase: 199 },
      { id: 'mexicana', nombre: 'Mexicana', descripcion: '', imagen: '', precioBase: 199 }
    ];

    const mockOrders: Order[] = [
      {
        id: 'mock-1',
        orderNumber: '#0001',
        status: 'Entregado',
        time: '08:15 AM',
        timestamp: Date.now() - 3600000 * 3,
        total: 249,
        items: [
          {
            id: 'item-1',
            pizza: mockPizzas[0],
            cantidad: 1,
            precioUnitario: 249,
            totalItem: 249,
            size: { nombre: 'Grande', medida: '16"', precio: 199 },
            masa: { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
            salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
            queso: { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
            extras: [{ nombre: 'Pepperoni', precio: 15, categoria: 'extra' }]
          }
        ]
      },
      {
        id: 'mock-2',
        orderNumber: '#0002',
        status: 'Listo',
        time: '09:02 AM',
        timestamp: Date.now() - 3600000 * 2,
        total: 199,
        items: [
          {
            id: 'item-2',
            pizza: mockPizzas[1],
            cantidad: 1,
            precioUnitario: 199,
            totalItem: 199,
            size: { nombre: 'Grande', medida: '16"', precio: 199 },
            masa: { nombre: 'Delgada', precio: 0, categoria: 'masa' },
            salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
            queso: { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
            extras: []
          }
        ]
      },
      {
        id: 'mock-3',
        orderNumber: '#0003',
        status: 'Preparando',
        time: '09:10 AM',
        timestamp: Date.now() - 1800000,
        total: 219,
        items: [
          {
            id: 'item-3',
            pizza: mockPizzas[2],
            cantidad: 1,
            precioUnitario: 219,
            totalItem: 219,
            size: { nombre: 'Grande', medida: '16"', precio: 199 },
            masa: { nombre: 'Gruesa', precio: 10, categoria: 'masa' },
            salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
            queso: { nombre: 'Cheddar', precio: 10, categoria: 'queso' },
            extras: []
          }
        ]
      },
      {
        id: 'mock-4',
        orderNumber: '#0004',
        status: 'Pendiente',
        time: '09:12 AM',
        timestamp: Date.now() - 300000,
        total: 448,
        items: [
          {
            id: 'item-4a',
            pizza: mockPizzas[0],
            cantidad: 1,
            precioUnitario: 249,
            totalItem: 249,
            size: { nombre: 'Grande', medida: '16"', precio: 199 },
            masa: { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
            salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
            queso: { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
            extras: [{ nombre: 'Pepperoni', precio: 15, categoria: 'extra' }]
          },
          {
            id: 'item-4b',
            pizza: mockPizzas[1],
            cantidad: 1,
            precioUnitario: 199,
            totalItem: 199,
            size: { nombre: 'Grande', medida: '16"', precio: 199 },
            masa: { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
            salsa: { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
            queso: { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
            extras: []
          }
        ]
      }
    ];

    this.orders.set(mockOrders);
    this.saveToStorage();
  }
}
