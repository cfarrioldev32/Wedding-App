import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, interval, takeUntil } from 'rxjs';

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-countdown.component.html',
  styleUrls: ['./invitation-countdown.component.scss']
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input({ required: true }) targetDate!: Date;

  parts: CountdownParts = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  isComplete = false;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateParts();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateParts());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateParts(): void {
    const now = new Date();
    const diff = this.targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.isComplete = true;
      this.parts = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.parts = { days, hours, minutes, seconds };
  }
}
