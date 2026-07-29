import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineAdd } from './medicine-add';

describe('MedicineAdd', () => {
  let component: MedicineAdd;
  let fixture: ComponentFixture<MedicineAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
