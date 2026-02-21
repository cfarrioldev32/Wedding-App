import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterFormComponent } from './register-form.component';

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable attendees when attendance is confirmed', () => {
    const attendanceCtrl = component.registroForm.get('attendanceConfirmed');
    const attendeesCtrl = component.registroForm.get('attendeesCount');

    attendanceCtrl?.setValue(true);
    fixture.detectChanges();

    expect(attendeesCtrl?.enabled).toBeTrue();
    expect(attendeesCtrl?.value).toBe(1);
  });

  it('should disable attendees when attendance is not confirmed', () => {
    const attendanceCtrl = component.registroForm.get('attendanceConfirmed');
    const attendeesCtrl = component.registroForm.get('attendeesCount');

    attendanceCtrl?.setValue(false);
    fixture.detectChanges();

    expect(attendeesCtrl?.disabled).toBeTrue();
    expect(attendeesCtrl?.value).toBe(0);
  });
});
