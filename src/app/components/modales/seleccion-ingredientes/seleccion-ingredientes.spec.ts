import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionIngredientes } from './seleccion-ingredientes';

describe('SeleccionIngredientes', () => {
  let component: SeleccionIngredientes;
  let fixture: ComponentFixture<SeleccionIngredientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionIngredientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionIngredientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
