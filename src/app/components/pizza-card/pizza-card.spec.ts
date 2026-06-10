import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PizzaCard } from './pizza-card';

describe('PizzaCard', () => {
  let component: PizzaCard;
  let fixture: ComponentFixture<PizzaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PizzaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PizzaCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pizza', {
      id: '1',
      nombre: 'Margarita',
      descripcion: 'Clásica',
      imagen: '',
      precioBase: 100
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
