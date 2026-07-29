import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineEdit } from './medicine-edit';

describe('MedicineEdit', () => {
  let component: MedicineEdit;
  let fixture: ComponentFixture<MedicineEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
