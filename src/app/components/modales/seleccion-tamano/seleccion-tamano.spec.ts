import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionTamano } from './seleccion-tamano';

describe('SeleccionTamano', () => {
  let component: SeleccionTamano;
  let fixture: ComponentFixture<SeleccionTamano>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionTamano]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionTamano);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
