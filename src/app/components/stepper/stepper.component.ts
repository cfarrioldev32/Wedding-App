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
    // TODO: Reemplazar textos, imagenes y puntajes con el contenido real del quiz.
    {
      id: 'q1',
      text: 'Como se conocio la pareja?',
      imageUrl:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop',
      imageAlt: 'Pareja en un parque',
      options: [
        { id: 'A', label: 'En la universidad', points: 10 },
        { id: 'B', label: 'En el trabajo', points: 0 },
        { id: 'C', label: 'En una fiesta', points: 0 },
        { id: 'D', label: 'Por amigos en comun', points: 0 }
      ]
    },
    {
      id: 'q2',
      text: 'Cual es el hobby favorito del novio?',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop',
      imageAlt: 'Montanas y aventura',
      options: [
        { id: 'A', label: 'Cocinar', points: 0 },
        { id: 'B', label: 'Senderismo', points: 10 },
        { id: 'C', label: 'Videojuegos', points: 0 },
        { id: 'D', label: 'Fotografia', points: 0 }
      ]
    },
    {
      id: 'q3',
      text: 'Cual es la cancion que mas los representa?',
      imageUrl:
        'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&auto=format&fit=crop',
      imageAlt: 'Pareja bailando',
      options: [
        { id: 'A', label: 'Perfect - Ed Sheeran', points: 0 },
        { id: 'B', label: 'A Thousand Years - Christina Perri', points: 10 },
        { id: 'C', label: 'All of Me - John Legend', points: 0 },
        { id: 'D', label: 'Yellow - Coldplay', points: 0 }
      ]
    },
    {
      id: 'q4',
      text: 'A que ciudad sueñan con viajar juntos?',
      imageUrl:
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
      imageAlt: 'Ciudad iluminada',
      options: [
        { id: 'A', label: 'Paris', points: 10 },
        { id: 'B', label: 'Tokio', points: 0 },
        { id: 'C', label: 'Nueva York', points: 0 },
        { id: 'D', label: 'Roma', points: 0 }
      ]
    },
    {
      id: 'q5',
      text: 'Quien dijo \"te amo\" primero?',
      imageUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop',
      imageAlt: 'Pareja sonriendo',
      options: [
        { id: 'A', label: 'La novia', points: 10 },
        { id: 'B', label: 'El novio', points: 0 },
        { id: 'C', label: 'Fue al mismo tiempo', points: 0 },
        { id: 'D', label: 'Nadie, lo demostraron', points: 0 }
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

