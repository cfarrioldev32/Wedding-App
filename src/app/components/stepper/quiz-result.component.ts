import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuizAnswers, QuizQuestion, QuizScoreResult } from './quiz.models';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.css'
})
export class QuizResultComponent {
  @Input({ required: true }) result!: QuizScoreResult;
  @Input({ required: true }) questions!: QuizQuestion[];
  @Input({ required: true }) answers!: QuizAnswers;
  @Input() rankingText = '';

  @Output() restart = new EventEmitter<void>();

  trackById = (_: number, item: { questionId: string }) => item.questionId;
}
