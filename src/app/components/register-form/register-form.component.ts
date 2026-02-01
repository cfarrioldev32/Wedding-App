import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  registroForm: FormGroup;
  sellando: boolean = false;
  sellado: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pais: ['', Validators.required],
      invitados: [1, [Validators.required, Validators.min(1)]]
    });
  }

  registrar(): void {
    if (this.registroForm.valid) {
      console.log('Registro exitoso:', this.registroForm.value);
    }
  }
}
