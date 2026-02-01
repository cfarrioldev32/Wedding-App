import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { debounceTime, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import {
  QuizAnswerValue,
  QuizAnswers,
  QuizQuestion,
  QuizScoreResult
} from './quiz.models';
import { computeScore, getMaxScore } from './quiz-score.utils';
import { QuizQuestionStepComponent } from './quiz-question-step.component';
import { QuizResultComponent } from './quiz-result.component';
import { COUNTRIES } from './countries';
import { WishBoxComponent } from './wish-box.component';
import { WishDraft, WishPayload } from './wish.models';
import { WishService } from './wish.service';
import { RedirectCountdownComponent } from '../shared/redirect-countdown/redirect-countdown.component';

interface StoredQuizPayload {
  completedAt: string;
  answers: QuizAnswers;
  result: QuizScoreResult;
}

const STORAGE_KEY = 'wedding-quiz-result';
const WISH_DRAFT_KEY = 'wedding_wish_draft';

interface WishFormModel {
  country: FormControl<string>;
  reason: FormControl<string>;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatProgressBarModule,
    QuizQuestionStepComponent,
    QuizResultComponent,
    WishBoxComponent,
    RedirectCountdownComponent
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css'
})
export class StepperComponent implements OnDestroy {
  @ViewChild(MatStepper) private stepper?: MatStepper;

  readonly questions: QuizQuestion[] = [
    // TODO: Copiar las imagenes a /public/quiz y actualizar estas rutas.
    {
      id: 'q1',
      text: 'Quien es esta persona?',
      imageUrl: '/quiz/persona-1.png',
      imageAlt: 'Persona 1',
      options: [
        { id: 'A', label: 'Amiga de la novia', points: 10 },
        { id: 'B', label: 'Prima segunda del novio', points: 0 },
        { id: 'C', label: 'Mejor amiga de la novia', points: 0 }
      ]
    },
    {
      id: 'q2',
      text: 'A quien pertenece esta mascota?',
      imageUrl: '/quiz/mascota-1.png',
      imageAlt: 'Mascota',
      options: [
        { id: 'A', label: 'Perro de infancia del novio', points: 0 },
        { id: 'B', label: 'Perro actual de la pareja', points: 0 },
        { id: 'C', label: 'Ninguna de las anteriores', points: 10 }
      ]
    },
    {
      id: 'q3',
      text: 'Quien es esta persona?',
      imageUrl: '/quiz/persona-2.png',
      imageAlt: 'Persona 2',
      options: [
        { id: 'A', label: 'Prima del novio', points: 10 },
        { id: 'B', label: 'Vecina de la pareja', points: 0 },
        { id: 'C', label: 'Amiga de la novia', points: 0 }
      ]
    },
    {
      id: 'q4',
      text: 'Donde se tomo esta foto?',
      imageUrl: '/quiz/foto-roma.png',
      imageAlt: 'Foto en Roma',
      options: [
        { id: 'A', label: 'Paris', points: 0 },
        { id: 'B', label: 'Roma', points: 10 },
        { id: 'C', label: 'Argentina', points: 0 }
      ]
    }
  ];

  readonly form: FormGroup<Record<string, FormControl<QuizAnswerValue>>>;
  readonly wishForm: FormGroup<WishFormModel>;
  readonly countries = COUNTRIES;
  readonly filteredCountries$: Observable<string[]>;
  readonly maxReasonLength = 500;
  readonly locale =
    typeof navigator !== 'undefined' ? navigator.language : 'es-ES';
  stepIndex = 0;
  showResult = false;
  result: QuizScoreResult | null = null;
  rankingText = '';
  answersSnapshot: QuizAnswers = {};
  wishSubmitting = false;
  wishSuccessMessage = '';
  wishErrorMessage = '';
  showRedirect = false;
  autoRedirectEnabled = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly wishService: WishService
  ) {
    this.form = this.formBuilder.group({}) as FormGroup<
      Record<string, FormControl<QuizAnswerValue>>
    >;

    this.questions.forEach((question) => {
      const control = new FormControl<QuizAnswerValue>(
        this.getInitialValue(question),
        {
          nonNullable: true,
          validators: question.allowMultiple
            ? [this.atLeastOneSelectedValidator()]
            : [Validators.required]
        }
      );
      this.form.addControl(question.id, control);
    });

    this.wishForm = this.formBuilder.group({
      country: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)]
      }),
      reason: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(this.maxReasonLength)
        ]
      })
    });

    this.filteredCountries$ = this.wishForm.controls.country.valueChanges.pipe(
      startWith(this.wishForm.controls.country.value),
      map((value) => this.filterCountries(value))
    );

    this.wishForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.persistWishDraft());

    this.restoreFromStorage();
    this.restoreWishDraft();
  }

  get totalSteps(): number {
    return this.questions.length + 1;
  }

  get progressPercent(): number {
    if (this.totalSteps === 0) {
      return 0;
    }

    return ((this.stepIndex + 1) / this.totalSteps) * 100;
  }

  getControl(questionId: string): FormControl<QuizAnswerValue> {
    return this.form.get(questionId) as FormControl<QuizAnswerValue>;
  }

  get countryControl(): FormControl<string> {
    return this.wishForm.controls.country;
  }

  get reasonControl(): FormControl<string> {
    return this.wishForm.controls.reason;
  }

  onStepChange(event: StepperSelectionEvent): void {
    this.stepIndex = event.selectedIndex;
  }

  onToggleMultiple({
    questionId,
    optionId,
    checked
  }: {
    questionId: string;
    optionId: string;
    checked: boolean;
  }): void {
    const control = this.getControl(questionId);
    const current = Array.isArray(control.value) ? [...control.value] : [];
    const next = checked
      ? Array.from(new Set([...current, optionId]))
      : current.filter((id) => id !== optionId);

    control.setValue(next);
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  finishQuiz(): void {
    if (!this.isLastStepValid()) {
      return;
    }

    const answers = this.form.getRawValue() as QuizAnswers;
    const result = computeScore(answers, this.questions);

    this.result = result;
    this.rankingText = this.getRankingText(result.percent);
    this.answersSnapshot = answers;
    this.showResult = true;
    this.startRedirect();

    this.persistResult({
      completedAt: new Date().toISOString(),
      answers,
      result
    });
  }

  saveWishDraft(): void {
    this.persistWishDraft();
    this.wishSuccessMessage = 'Borrador guardado.';
    this.wishErrorMessage = '';
  }

  clearWishDraft(): void {
    this.clearWishDraftStorage();
    this.wishForm.reset({ country: '', reason: '' });
    this.wishSuccessMessage = '';
    this.wishErrorMessage = '';
  }

  submitWish(): void {
    if (this.wishForm.invalid) {
      this.wishForm.markAllAsTouched();
      return;
    }

    this.wishSubmitting = true;
    this.wishSuccessMessage = '';
    this.wishErrorMessage = '';

    const payload: WishPayload = {
      id: this.generateId(),
      country: this.countryControl.value.trim(),
      reason: this.reasonControl.value.trim(),
      createdAt: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      locale: this.locale
    };

    this.wishService
      .submitWish(payload)
      .then(() => {
        this.wishSuccessMessage = 'Deseo enviado. Gracias por compartirlo.';
        this.clearWishDraftStorage();
        setTimeout(() => this.finishQuiz(), 600);
      })
      .catch((error) => {
        console.error('Error enviando deseo', error);
        this.wishErrorMessage =
          'No pudimos enviar el deseo. Probemos de nuevo en un momento.';
      })
      .finally(() => {
        this.wishSubmitting = false;
      });
  }

  restartQuiz(): void {
    this.clearStorage();
    this.clearWishDraftStorage();
    this.showResult = false;
    this.result = null;
    this.rankingText = '';
    this.answersSnapshot = {};
    this.stepIndex = 0;
    this.wishSuccessMessage = '';
    this.wishErrorMessage = '';
    this.wishSubmitting = false;
    this.showRedirect = false;
    this.autoRedirectEnabled = false;

    this.questions.forEach((question) => {
      const control = this.getControl(question.id);
      control.setValue(this.getInitialValue(question));
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    });

    this.wishForm.reset({ country: '', reason: '' });
    this.stepper?.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getInitialValue(question: QuizQuestion): QuizAnswerValue {
    return question.allowMultiple ? [] : '';
  }

  private isLastStepValid(): boolean {
    return this.wishForm.valid;
  }

  private getRankingText(percent: number): string {
    if (percent < 40) {
      return 'Nos estas conociendo';
    }

    if (percent <= 70) {
      return 'Buen nivel';
    }

    return 'Nos conoces demasiado 😄';
  }

  private atLeastOneSelectedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return Array.isArray(value) && value.length > 0 ? null : { required: true };
    };
  }

  private persistResult(payload: StoredQuizPayload): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const payload = JSON.parse(stored) as StoredQuizPayload;
      this.result = payload.result;
      this.rankingText = this.getRankingText(payload.result.percent);
      this.answersSnapshot = payload.answers;
      this.showResult = true;
      this.showRedirect = false;
      this.autoRedirectEnabled = false;
      this.form.patchValue(payload.answers);
    } catch {
      this.clearStorage();
    }
  }

  private persistWishDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const draft: WishDraft = {
      country: this.countryControl.value,
      reason: this.reasonControl.value,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(WISH_DRAFT_KEY, JSON.stringify(draft));
  }

  private restoreWishDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = localStorage.getItem(WISH_DRAFT_KEY);
    if (!stored) {
      return;
    }

    try {
      const draft = JSON.parse(stored) as WishDraft;
      this.wishForm.patchValue({
        country: draft.country ?? '',
        reason: draft.reason ?? ''
      });
    } catch {
      this.clearWishDraftStorage();
    }
  }

  private clearWishDraftStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(WISH_DRAFT_KEY);
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }

  readonly maxScore = getMaxScore(this.questions);

  private filterCountries(value: string): string[] {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return this.countries.slice(0, 12);
    }

    return this.countries
      .filter((country) => country.toLowerCase().includes(normalized))
      .slice(0, 12);
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `wish_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  private startRedirect(): void {
    this.showRedirect = true;
    this.autoRedirectEnabled = true;
  }

  onRedirectCancelled(): void {
    this.autoRedirectEnabled = false;
    this.showRedirect = false;
  }

  onRedirected(): void {
    this.autoRedirectEnabled = false;
  }
}

