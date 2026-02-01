import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TravelHeroAnimationComponent } from './travel-hero-animation/travel-hero-animation.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, TravelHeroAnimationComponent],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  registroForm: FormGroup;
  sellando: boolean = false;
  sellado: boolean = false;
  debugAnchors = false;

  @ViewChild('anchorAr', { static: true }) anchorArRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('anchorEs', { static: true }) anchorEsRef!: ElementRef<HTMLSpanElement>;

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
