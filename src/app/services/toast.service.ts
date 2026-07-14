import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public readonly toasts = signal<ToastMessage[]>([]);

  public show(title: string, message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = Date.now();
    const newToast: ToastMessage = { id, title, message, type };
    this.toasts.update(current => [...current, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.toasts.update(current => current.filter(t => t.id !== id));
    }, 4000);
  }

  public remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
