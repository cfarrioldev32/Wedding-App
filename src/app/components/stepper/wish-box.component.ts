import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { Observable } from 'rxjs';

interface WishFormModel {
  country: FormControl<string>;
  reason: FormControl<string>;
}

@Component({
  selector: 'app-wish-box',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  templateUrl: './wish-box.component.html',
  styleUrls: ['./wish-box.component.scss']
})
export class WishBoxComponent {
  @Input({ required: true }) form!: FormGroup<WishFormModel>;
  @Input({ required: true }) filteredCountries$!: Observable<string[]>;
  @Input() isSubmitting = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() maxReasonLength = 500;

  @Output() saveDraft = new EventEmitter<void>();
  @Output() clearDraft = new EventEmitter<void>();
  @Output() submitWish = new EventEmitter<void>();

  get countryControl(): FormControl<string> {
    return this.form.controls.country;
  }

  get reasonControl(): FormControl<string> {
    return this.form.controls.reason;
  }

  get reasonCount(): number {
    return this.reasonControl.value.length;
  }
}
