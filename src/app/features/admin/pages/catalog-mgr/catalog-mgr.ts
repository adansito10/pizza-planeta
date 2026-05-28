import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { Pizza, SizeOption, IngredientOption } from '../../../../services/cart.service';

@Component({
  selector: 'app-catalog-mgr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-mgr.html',
  styleUrl: './catalog-mgr.scss'
})
export class CatalogMgrComponent {
  public readonly productService = inject(ProductService);

  // Sub-navigation tab: pizzas, ingredients (extras), options (masas, salsas, quesos), sizes
  public readonly activeSubTab = signal<'pizzas' | 'ingredients' | 'options' | 'sizes'>('pizzas');

  // Form Editor control signals
  public readonly isEditingPizza = signal<boolean>(false);
  public readonly selectedPizza = signal<Pizza | null>(null);

  public readonly isEditingIngredient = signal<boolean>(false);
  public readonly selectedIngredient = signal<IngredientOption | null>(null);
  private ingredientOldName = '';

  public readonly isEditingSize = signal<boolean>(false);
  public readonly selectedSize = signal<SizeOption | null>(null);
  private sizeOldName = '';

  // Form pizza models
  public pizzaNombre = '';
  public pizzaPrecio = 199;
  public pizzaDescripcion = '';
  public pizzaImagen = '';
  public pizzaDefaultMasa = 'Tradicional';
  public pizzaDefaultSalsa = 'Salsa de Tomate';
  public pizzaDefaultQueso = 'Mozzarella';
  public pizzaDefaultExtras: string[] = [];

  // Form ingredient models
  public ingredientNombre = '';
  public ingredientPrecio = 10;
  public ingredientCategoria: 'masa' | 'salsa' | 'queso' | 'extra' = 'extra';

  // Form size models
  public sizeNombre = '';
  public sizeMedida = '';
  public sizePrecio = 99;

  public setSubTab(tab: 'pizzas' | 'ingredients' | 'options' | 'sizes'): void {
    this.activeSubTab.set(tab);
  }

  // --- PIZZAS EDIT METHODS ---
  public openNewPizzaForm(): void {
    this.selectedPizza.set(null);
    this.pizzaNombre = '';
    this.pizzaPrecio = 199;
    this.pizzaDescripcion = '';
    this.pizzaImagen = '';

    const masas = this.getIngredientsOfCategory('masa');
    const salsas = this.getIngredientsOfCategory('salsa');
    const quesos = this.getIngredientsOfCategory('queso');

    this.pizzaDefaultMasa = masas.length > 0 ? masas[0].nombre : 'Tradicional';
    this.pizzaDefaultSalsa = salsas.length > 0 ? salsas[0].nombre : 'Salsa de Tomate';
    this.pizzaDefaultQueso = quesos.length > 0 ? quesos[0].nombre : 'Mozzarella';
    this.pizzaDefaultExtras = [];
    this.isEditingPizza.set(true);
  }

  public openEditPizzaForm(pizza: Pizza): void {
    this.selectedPizza.set(pizza);
    this.pizzaNombre = pizza.nombre;
    this.pizzaPrecio = pizza.precioBase;
    this.pizzaDescripcion = pizza.descripcion;
    this.pizzaImagen = pizza.imagen;
    this.pizzaDefaultMasa = pizza.defaultMasa || 'Tradicional';
    this.pizzaDefaultSalsa = pizza.defaultSalsa || 'Salsa de Tomate';
    this.pizzaDefaultQueso = pizza.defaultQueso || 'Mozzarella';
    this.pizzaDefaultExtras = pizza.defaultExtras ? [...pizza.defaultExtras] : [];
    this.isEditingPizza.set(true);
  }

  public savePizza(): void {
    if (!this.pizzaNombre.trim()) {
      alert('Por favor introduce el nombre de la pizza.');
      return;
    }

    const pizzaData = {
      nombre: this.pizzaNombre.trim(),
      precioBase: this.pizzaPrecio,
      descripcion: this.pizzaDescripcion.trim(),
      imagen: this.pizzaImagen.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      defaultMasa: this.pizzaDefaultMasa,
      defaultSalsa: this.pizzaDefaultSalsa,
      defaultQueso: this.pizzaDefaultQueso,
      defaultExtras: this.pizzaDefaultExtras
    };

    const currentPizza = this.selectedPizza();
    if (currentPizza) {
      this.productService.updatePizza({ ...currentPizza, ...pizzaData });
    } else {
      this.productService.addPizza(pizzaData);
    }
    this.isEditingPizza.set(false);
  }

  public deletePizza(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta pizza?')) {
      this.productService.deletePizza(id);
    }
  }

  public togglePizzaDefaultExtra(extraName: string): void {
    if (this.pizzaDefaultExtras.includes(extraName)) {
      this.pizzaDefaultExtras = this.pizzaDefaultExtras.filter(name => name !== extraName);
    } else {
      this.pizzaDefaultExtras = [...this.pizzaDefaultExtras, extraName];
    }
  }

  public isPizzaDefaultExtraSelected(extraName: string): boolean {
    return this.pizzaDefaultExtras.includes(extraName);
  }

  // --- INGREDIENTS EDIT METHODS ---
  public openNewIngredientForm(defaultCat: 'masa' | 'salsa' | 'queso' | 'extra'): void {
    this.selectedIngredient.set(null);
    this.ingredientNombre = '';
    this.ingredientPrecio = defaultCat === 'extra' ? 15 : 10;
    this.ingredientCategoria = defaultCat;
    this.ingredientOldName = '';
    this.isEditingIngredient.set(true);
  }

  public openEditIngredientForm(ing: IngredientOption): void {
    this.selectedIngredient.set(ing);
    this.ingredientNombre = ing.nombre;
    this.ingredientPrecio = ing.precio;
    this.ingredientCategoria = ing.categoria;
    this.ingredientOldName = ing.nombre;
    this.isEditingIngredient.set(true);
  }

  public saveIngredient(): void {
    if (!this.ingredientNombre.trim()) {
      alert('Por favor introduce el nombre del ingrediente.');
      return;
    }

    const ingData: IngredientOption = {
      nombre: this.ingredientNombre.trim(),
      precio: this.ingredientPrecio,
      categoria: this.ingredientCategoria
    };

    const currentIng = this.selectedIngredient();
    if (currentIng) {
      this.productService.updateIngredient(this.ingredientOldName, ingData);
    } else {
      this.productService.addIngredient(ingData);
    }
    this.isEditingIngredient.set(false);
  }

  public deleteIngredient(name: string): void {
    if (confirm(`¿Deseas eliminar el ingrediente "${name}"?`)) {
      this.productService.deleteIngredient(name);
    }
  }

  public getIngredientsOfCategory(cat: 'masa' | 'salsa' | 'queso' | 'extra'): IngredientOption[] {
    return this.productService.ingredients().filter(i => i.categoria === cat);
  }

  // --- SIZES EDIT METHODS ---
  public openNewSizeForm(): void {
    this.selectedSize.set(null);
    this.sizeNombre = '';
    this.sizeMedida = '';
    this.sizePrecio = 99;
    this.sizeOldName = '';
    this.isEditingSize.set(true);
  }

  public openEditSizeForm(size: SizeOption): void {
    this.selectedSize.set(size);
    this.sizeNombre = size.nombre;
    this.sizeMedida = size.medida;
    this.sizePrecio = size.precio;
    this.sizeOldName = size.nombre;
    this.isEditingSize.set(true);
  }

  public saveSize(): void {
    if (!this.sizeNombre.trim() || !this.sizeMedida.trim()) {
      alert('Por favor completa todos los campos del tamaño.');
      return;
    }

    const sizeData: SizeOption = {
      nombre: this.sizeNombre.trim(),
      medida: this.sizeMedida.trim(),
      precio: this.sizePrecio
    };

    const currentSize = this.selectedSize();
    if (currentSize) {
      this.productService.updateSize(this.sizeOldName, sizeData);
    } else {
      this.productService.addSize(sizeData);
    }
    this.isEditingSize.set(false);
  }

  public deleteSize(name: string): void {
    if (confirm(`¿Deseas eliminar el tamaño "${name}"?`)) {
      this.productService.deleteSize(name);
    }
  }

  // --- CATALOG RESET ---
  public resetCatalog(): void {
    if (confirm('¿Restablecer todo el catálogo (pizzas, ingredientes y tamaños) a sus valores predeterminados?')) {
      this.productService.resetCatalog();
    }
  }
}
