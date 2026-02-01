import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuizAnswers, QuizQuestion, QuizScoreResult } from './quiz.models';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.css'
})
export class QuizResultComponent {
  @Input({ required: true }) result!: QuizScoreResult;
  @Input({ required: true }) questions!: QuizQuestion[];
  @Input({ required: true }) answers!: QuizAnswers;
  @Input() rankingText = '';

  trackById = (_: number, item: { questionId: string }) => item.questionId;
}
