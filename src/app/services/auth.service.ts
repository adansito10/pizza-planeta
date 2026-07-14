import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  private readonly AUTH_KEY = 'planet_pizza_admin_session';
  private readonly CUSTOMER_TOKEN_KEY = 'planet_pizza_customer_token';
  private readonly CUSTOMER_USER_KEY = 'planet_pizza_customer_user';

  private readonly localAdmin = signal<boolean>(false);
  public readonly isLoggedIn = computed(() => 
    this.localAdmin() || 
    this.customerUser()?.rol === 'admin' || 
    this.customerUser()?.email === 'adandejesus200420@gmail.com'
  );

  // Customer login states
  public readonly customerUser = signal<{ id: string, nombre: string, apellido?: string, email: string, telefono?: string, recibePromos?: boolean, rol?: string } | null>(null);
  public readonly customerToken = signal<string | null>(null);
  public readonly isCustomerLoggedIn = computed(() => this.customerUser() !== null);

  constructor() {
    this.checkSession();
  }

  // --- Admin Login ---
  public login(usuario: string, contrasenia: string): boolean {
    if (usuario.trim() === 'admin' && contrasenia === 'admin123') {
      this.localAdmin.set(true);
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
    this.localAdmin.set(false);
    this.customerLogout();
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (e) {
      console.error('Error removing session from localStorage', e);
    }
  }

  // --- Customer Login ---
  public customerRegister(nombre: string, apellido: string, email: string, password: string, telefono: string, recibePromos: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { 
      nombre, 
      apellido, 
      correo: email, 
      contrasena: password, 
      telefono, 
      recibePromos 
    });
  }

  public customerLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password }).pipe(
      tap(res => {
        if (res.user) {
          if (res.user.correo && !res.user.email) {
            res.user.email = res.user.correo;
          }
        }
        this.customerToken.set(res.token);
        this.customerUser.set(res.user);
        try {
          localStorage.setItem(this.CUSTOMER_TOKEN_KEY, res.token);
          localStorage.setItem(this.CUSTOMER_USER_KEY, JSON.stringify(res.user));
        } catch (e) {
          console.error('Error saving customer session to localStorage', e);
        }
      })
    );
  }

  public customerLogout(): void {
    this.customerToken.set(null);
    this.customerUser.set(null);
    try {
      localStorage.removeItem(this.CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(this.CUSTOMER_USER_KEY);
    } catch (e) {
      console.error('Error removing customer session from localStorage', e);
    }
  }

  public customerUpdateProfile(userId: string, nombre: string, apellido: string, email: string, telefono: string, recibePromos: boolean, password?: string): Observable<any> {
    const payload = { 
      userId, 
      nombre, 
      apellido, 
      correo: email, 
      email,
      telefono, 
      recibePromos, 
      contrasena: password,
      password 
    };
    return this.http.put<any>(`${this.apiUrl}/update`, payload).pipe(
      tap(res => {
        if (res.user) {
          if (res.user.correo && !res.user.email) {
            res.user.email = res.user.correo;
          }
        }
        this.customerUser.set(res.user);
        try {
          localStorage.setItem(this.CUSTOMER_USER_KEY, JSON.stringify(res.user));
        } catch (e) {
          console.error('Error saving updated customer session to localStorage', e);
        }
      })
    );
  }

  public getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  private checkSession(): void {
    try {
      // Check admin session
      const active = localStorage.getItem(this.AUTH_KEY);
      if (active === 'true') {
        this.localAdmin.set(true);
      }

      // Check customer session
      const cToken = localStorage.getItem(this.CUSTOMER_TOKEN_KEY);
      const cUserStr = localStorage.getItem(this.CUSTOMER_USER_KEY);
      if (cToken && cUserStr) {
        const user = JSON.parse(cUserStr);
        if (user && user.correo && !user.email) {
          user.email = user.correo;
        }
        this.customerToken.set(cToken);
        this.customerUser.set(user);
      }
    } catch (e) {
      console.error('Error checking active session', e);
    }
  }
}
