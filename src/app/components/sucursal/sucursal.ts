import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const L: any;

@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursal.html',
  styleUrl: './sucursal.scss'
})
export class Sucursal implements AfterViewInit, OnDestroy {
  private map: any;

  public ngAfterViewInit(): void {
    // Wait a brief tick to ensure DOM is fully ready and painted
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  public ngOnDestroy(): void {
    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {
        console.error('Error removing map:', e);
      }
    }
  }

  private initMap(): void {
    const lat = 18.79507;
    const lng = -96.70406;

    try {
      // Initialize Leaflet map
      this.map = L.map('map-container').setView([lat, lng], 16);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Custom Leaflet DivIcon with ping animation and map marker icon
      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-red-600/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Add marker
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

      // Add custom popups
      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; text-align: center; min-width: 140px;">
          <h4 style="color: #ef4444; font-weight: 900; margin: 0 0 4px 0; font-size: 13px;">PLANETA PIZZA</h4>
          <p style="font-size: 10px; color: #64748b; margin: 0 0 6px 0; font-weight: bold;">Sucursal UTCV</p>
          <span style="font-size: 9px; background-color: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 9999px; font-weight: 800; display: inline-block;">Punto de Retiro</span>
        </div>
      `).openPopup();
    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
    }
  }
}
