import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-confirmacion-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion-orden.html',
  styleUrl: './confirmacion-orden.scss'
})
export class ConfirmacionOrden {
  public readonly cartService = inject(CartService);

  private getQRCodeBase64(pickupCode: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PLANET-PIZZA-ORDER-${pickupCode}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => {
        resolve('');
      };
    });
  }

  public imprimirTicket(): void {
    // Map current confirmed order details from CartService signals
    const orderData = {
      orderNumber: this.cartService.lastConfirmedOrderNumber(),
      clienteNombre: this.cartService.lastConfirmedOrderName(),
      time: this.cartService.lastConfirmedOrderTime(),
      pickupCode: this.cartService.lastConfirmedOrderPickupCode(),
      total: this.cartService.lastConfirmedOrderTotal(),
      items: this.cartService.lastConfirmedOrder(),
      paymentStatus: 'pending' // Cash orders start as pending payment
    };

    this.getQRCodeBase64(orderData.pickupCode || 'PP-XXXX').then((qrBase64) => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Ticket Border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 138, 200);

      // Brand Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(201, 44, 61); // Planeta Pizza Red
      doc.text('PLANETA PIZZA', 74, 20, { align: 'center' });

      // Subtitle
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('PASE DE RETIRO DIGITAL', 74, 25, { align: 'center' });

      // Separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(10, 30, 138, 30);

      // Customer Info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Cliente: ${orderData.clienteNombre || 'Cliente'}`, 12, 38);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Orden: ${orderData.orderNumber}`, 12, 44);
      doc.text(`Fecha: ${orderData.time || new Date().toLocaleTimeString()}`, 12, 50);

      // QR Code
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', 53, 58, 42, 42);
      }

      // Pickup Code Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('CODIGO DE RETIRO', 74, 110, { align: 'center' });
      
      // Pickup Code Value
      doc.setFontSize(24);
      doc.setTextColor(201, 44, 61);
      doc.text(orderData.pickupCode || 'PP-XXXX', 74, 121, { align: 'center' });

      // Separator line
      doc.line(10, 127, 138, 127);

      // Details Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('DETALLE DEL PEDIDO', 12, 134);

      // Render Items
      let y = 142;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach((item: any) => {
          if (y > 185) return;
          
          doc.setFont('Helvetica', 'bold');
          doc.text(`${item.cantidad}x ${item.pizza.nombre} (${item.size.nombre})`, 12, y);
          doc.setFont('Helvetica', 'normal');
          doc.text(`$${item.totalItem}`, 128, y, { align: 'right' });
          y += 5;
          
          const extras = [];
          if (item.masa) extras.push(`Masa: ${item.masa.nombre}`);
          if (item.salsa) extras.push(`Salsa: ${item.salsa.nombre}`);
          if (item.queso) extras.push(`Queso: ${item.queso.nombre}`);
          if (item.extras && item.extras.length > 0) {
            extras.push(`Extras: ${item.extras.map((e: any) => e.nombre).join(', ')}`);
          }
          
          doc.setFontSize(8);
          doc.setTextColor(130, 130, 130);
          doc.text(extras.join(' | '), 15, y, { maxWidth: 110 });
          y += 6;
          
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
        });
      }

      // Separator line
      doc.line(10, y + 1, 138, y + 1);
      y += 8;

      // Total Price
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL:', 12, y);
      doc.setFontSize(14);
      doc.setTextColor(201, 44, 61);
      doc.text(`$${orderData.total}`, 128, y, { align: 'right' });

      // Note Text
      y += 8;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const noteText = 'PAGO PENDIENTE EN CAJA. Presenta este QR en caja para pagar y preparar.';
      doc.text(noteText, 74, y, { align: 'center', maxWidth: 120 });

      // Save PDF
      doc.save(`ticket-${orderData.pickupCode || 'pedido'}.pdf`);
    });
  }

  public nuevaOrden(): void {
    this.cartService.closeModal();
  }
}
