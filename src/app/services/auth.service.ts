import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'planet_pizza_admin_session';

  // State signal for authentication status
  public readonly isLoggedIn = signal<boolean>(false);

  constructor() {
    this.checkSession();
  }

  public login(usuario: string, contrasenia: string): boolean {
    // Validate credentials (admin / admin123)
    if (usuario.trim() === 'admin' && contrasenia === 'admin123') {
      this.isLoggedIn.set(true);
      try {
        localStorage.setItem(this.AUTH_KEY, 'true');
      } catch (e) {
        console.error('Error saving session to localStorage', e);
      }
      return true;
    }
    return false;
  }

  public logout(): void {
    this.isLoggedIn.set(false);
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (e) {
      console.error('Error removing session from localStorage', e);
    }
  }

  private checkSession(): void {
    try {
      const active = localStorage.getItem(this.AUTH_KEY);
      if (active === 'true') {
        this.isLoggedIn.set(true);
      }
    } catch (e) {
      console.error('Error checking active session', e);
    }
  }
}
