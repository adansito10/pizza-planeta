import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api-pizzeria-production.up.railway.app/api/auth';

  private readonly AUTH_KEY = 'planet_pizza_admin_session';
  private readonly CUSTOMER_TOKEN_KEY = 'planet_pizza_customer_token';
  private readonly CUSTOMER_USER_KEY = 'planet_pizza_customer_user';

  private readonly localAdmin = signal<boolean>(false);
  public readonly isLoggedIn = computed(() => 
    this.localAdmin() || 
    this.customerUser()?.rol === 'admin' || 
    this.customerUser()?.email === 'adandejesus200420@gmail.com' ||
    this.customerUser()?.email === 'admin@planetpizza.com'
  );

  // Customer login states
  public readonly customerUser = signal<{ id: string, nombre: string, apellido?: string, email: string, telefono?: string, recibePromos?: boolean, rol?: string } | null>(null);
  public readonly customerToken = signal<string | null>(null);
  public readonly isCustomerLoggedIn = computed(() => this.customerUser() !== null);

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

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
        let user = res.user;
        if (!user && res.token) {
          const decoded = this.decodeToken(res.token);
          if (decoded) {
            user = {
              id: decoded.id,
              nombre: decoded.nombre,
              apellido: decoded.apellido || '',
              email: decoded.email || decoded.correo,
              correo: decoded.correo || decoded.email,
              telefono: decoded.telefono || '',
              rol: decoded.rol
            };
          }
        }
        if (user) {
          if (user.correo && !user.email) {
            user.email = user.correo;
          }
        }
        this.customerToken.set(res.token);
        this.customerUser.set(user);
        try {
          localStorage.setItem(this.CUSTOMER_TOKEN_KEY, res.token);
          localStorage.setItem(this.CUSTOMER_USER_KEY, JSON.stringify(user));
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
    // Swagger: PUT /api/users/{id}
    return this.http.put<any>(`https://api-pizzeria-production.up.railway.app/api/users/${userId}`, payload).pipe(
      tap(res => {
        let updatedUser = res.user || res;
        if (!updatedUser || !updatedUser.nombre) {
          updatedUser = {
            ...this.customerUser(),
            nombre: nombre,
            apellido: apellido,
            email: email,
            correo: email,
            telefono: telefono,
            recibePromos: recibePromos
          };
        }
        if (updatedUser.correo && !updatedUser.email) {
          updatedUser.email = updatedUser.correo;
        }
        this.customerUser.set(updatedUser);
        try {
          localStorage.setItem(this.CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
        } catch (e) {
          console.error('Error saving updated customer session to localStorage', e);
        }
      })
    );
  }

  public getAllUsers(): Observable<any[]> {
    // Swagger: GET /api/users
    return this.http.get<any[]>(`https://api-pizzeria-production.up.railway.app/api/users`);
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
      if (cToken) {
        let user = null;
        if (cUserStr && cUserStr !== 'undefined') {
          try {
            user = JSON.parse(cUserStr);
          } catch (e) {}
        }
        
        if (!user || !user.nombre) {
          const decoded = this.decodeToken(cToken);
          if (decoded) {
            user = {
              id: decoded.id,
              nombre: decoded.nombre,
              apellido: decoded.apellido || '',
              email: decoded.email || decoded.correo,
              correo: decoded.correo || decoded.email,
              telefono: decoded.telefono || '',
              rol: decoded.rol
            };
          }
        }

        if (user) {
          if (user.correo && !user.email) {
            user.email = user.correo;
          }
          this.customerToken.set(cToken);
          this.customerUser.set(user);
        }
      }
    } catch (e) {
      console.error('Error checking active session', e);
    }
  }
}
