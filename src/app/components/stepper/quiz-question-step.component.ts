import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { QuizAnswerValue, QuizQuestion } from './quiz.models';

@Component({
  selector: 'app-quiz-question-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './quiz-question-step.component.html',
  styleUrl: './quiz-question-step.component.css'
})
export class QuizQuestionStepComponent {
  @Input({ required: true }) question!: QuizQuestion;
  @Input({ required: true }) control!: FormControl<QuizAnswerValue>;

  @Output() toggleMultiple = new EventEmitter<{
    questionId: string;
    optionId: string;
    checked: boolean;
  }>();

  isSelected(optionId: string): boolean {
    const value = this.control.value;
    return Array.isArray(value) && value.includes(optionId);
  }

  onToggle(optionId: string, event: MatCheckboxChange): void {
    this.toggleMultiple.emit({
      questionId: this.question.id,
      optionId,
      checked: event.checked
    });
  }
}
