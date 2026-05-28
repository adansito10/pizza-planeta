import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  public readonly orderService = inject(OrderService);

  // Hourly statistics for SVG chart simulation
  public readonly hourlySales = [
    { label: '08:00', sales: 249 },
    { label: '09:00', sales: 866 },
    { label: '10:00', sales: 430 },
    { label: '11:00', sales: 650 },
    { label: '12:00', sales: 1100 },
    { label: '13:00', sales: 1450 },
    { label: '14:00', sales: 900 }
  ];

  public get maxSales(): number {
    return Math.max(...this.hourlySales.map(h => h.sales), 100);
  }

  public getBarHeight(sales: number): number {
    return (sales / this.maxSales) * 120; // Max height in SVG is 120px
  }
}
