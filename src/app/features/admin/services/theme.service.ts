import { Injectable, signal, effect } from '@angular/core';

export interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  bgColor: string;
  class: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'planet_pizza_admin_theme';

  public readonly THEMES: ThemeOption[] = [
    {
      id: 'pizza-red',
      name: 'Rojo Planet Pizza',
      primaryColor: '#d00000',
      bgColor: 'bg-red-50/30',
      class: 'admin-theme-red'
    }
  ];

  public readonly activeThemeId = signal<string>('pizza-red');

  constructor() {
    // Lock to pizza-red
    this.activeThemeId.set('pizza-red');
  }

  public get activeTheme() {
    return this.THEMES.find(t => t.id === this.activeThemeId()) || this.THEMES[0];
  }

  public setTheme(themeId: string): void {
    if (this.THEMES.some(t => t.id === themeId)) {
      this.activeThemeId.set(themeId);
      localStorage.setItem(this.THEME_KEY, themeId);
    }
  }
}
