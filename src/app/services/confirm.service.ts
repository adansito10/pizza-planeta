import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  public readonly activeConfirm = signal<ConfirmOptions | null>(null);

  public ask(options: ConfirmOptions): void {
    this.activeConfirm.set(options);
  }

  public confirm(): void {
    const active = this.activeConfirm();
    if (active) {
      active.onConfirm();
    }
    this.activeConfirm.set(null);
  }

  public cancel(): void {
    this.activeConfirm.set(null);
  }
}
