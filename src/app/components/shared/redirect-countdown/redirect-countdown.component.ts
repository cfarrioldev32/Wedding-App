import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-redirect-countdown',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './redirect-countdown.component.html',
  styleUrls: ['./redirect-countdown.component.scss']
})
export class RedirectCountdownComponent implements OnInit, OnDestroy {
  @Input() seconds = 10;
  @Input() message = 'Seras redirigido a la invitacion...';
  @Input() targetRoute = '/invitation';

  @Output() cancelled = new EventEmitter<void>();
  @Output() redirected = new EventEmitter<void>();

  remaining = 10;
  isActive = true;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.remaining = this.seconds;
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isActive) {
          return;
        }
        this.remaining -= 1;
        if (this.remaining <= 0) {
          this.goNow();
        }
      });
  }

  cancel(): void {
    this.isActive = false;
    this.destroy$.next();
    this.cancelled.emit();
  }

  goNow(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    this.destroy$.next();
    this.redirected.emit();
    this.router.navigateByUrl(this.targetRoute).catch((error) => {
      console.error('Redirect failed', error);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
