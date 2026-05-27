import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionOrden } from './confirmacion-orden';

describe('ConfirmacionOrden', () => {
  let component: ConfirmacionOrden;
  let fixture: ComponentFixture<ConfirmacionOrden>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionOrden]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmacionOrden);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
