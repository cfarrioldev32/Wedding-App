import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';

@Component({
  selector: 'app-landing-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-splash.component.html',
  styleUrls: ['./landing-splash.component.scss']
})
export class LandingSplashComponent implements OnDestroy {
  isAnimating = false;
  reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly router: Router) {}

  start(): void {
    if (this.isAnimating) {
      return;
    }
    this.isAnimating = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasUserInteracted', 'true');
    }

    const duration = this.reduceMotion ? 200 : 1100;
    timer(duration).subscribe(() => {
      this.router.navigateByUrl('/register').catch((error) => {
        console.error('Navigation failed', error);
      });
    });
  }

  onAnimationEnd(): void {
    if (!this.reduceMotion) {
      this.router.navigateByUrl('/register').catch((error) => {
        console.error('Navigation failed', error);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
