import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { gsap } from 'gsap';
import { Point, prefersReducedMotion } from './travel-hero-animation.utils';

@Component({
  selector: 'app-travel-hero-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel-hero-animation.component.html',
  styleUrls: ['./travel-hero-animation.component.scss']
})
export class TravelHeroAnimationComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() durationSeconds = 6.5;
  @Input() anchorAr?: ElementRef<HTMLElement>;
  @Input() anchorEs?: ElementRef<HTMLElement>;
  @Input() debug = false;

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgEl', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('routeLine', { static: true }) lineRef!: ElementRef<SVGLineElement>;
  @ViewChild('startDot', { static: true }) startDotRef!: ElementRef<SVGCircleElement>;
  @ViewChild('endDot', { static: true }) endDotRef!: ElementRef<SVGCircleElement>;
  @ViewChild('planeEl', { static: true }) planeRef!: ElementRef<SVGImageElement>;
  @ViewChild('heartEl', { static: true }) heartRef!: ElementRef<SVGGElement>;

  private readonly destroy$ = new Subject<void>();
  private timeline: gsap.core.Timeline | null = null;
  private lastStart: Point = { x: 0, y: 0 };
  private lastEnd: Point = { x: 0, y: 0 };
  private planeCenter: Point = { x: 0, y: 0 };
  private heartCenter: Point = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    this.renderRoute();

    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.renderRoute());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['anchorAr'] || changes['anchorEs']) {
      this.renderRoute();
    }
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderRoute(): void {
    const container = this.containerRef.nativeElement;
    const { width, height } = container.getBoundingClientRect();
    if (width < 10 || height < 10) {
      return;
    }
    if (!this.anchorAr?.nativeElement || !this.anchorEs?.nativeElement) {
      return;
    }

    this.svgRef.nativeElement.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const hostRect = container.getBoundingClientRect();
    const arRect = this.anchorAr.nativeElement.getBoundingClientRect();
    const esRect = this.anchorEs.nativeElement.getBoundingClientRect();

    const start: Point = {
      x: arRect.left + arRect.width / 2 - hostRect.left,
      y: arRect.top + arRect.height / 2 - hostRect.top
    };
    const end: Point = {
      x: esRect.left + esRect.width / 2 - hostRect.left,
      y: esRect.top + esRect.height / 2 - hostRect.top
    };

    this.lastStart = start;
    this.lastEnd = end;

    this.lineRef.nativeElement.setAttribute('x1', start.x.toFixed(2));
    this.lineRef.nativeElement.setAttribute('y1', start.y.toFixed(2));
    this.lineRef.nativeElement.setAttribute('x2', end.x.toFixed(2));
    this.lineRef.nativeElement.setAttribute('y2', end.y.toFixed(2));

    this.startDotRef.nativeElement.setAttribute('cx', start.x.toFixed(2));
    this.startDotRef.nativeElement.setAttribute('cy', start.y.toFixed(2));
    this.endDotRef.nativeElement.setAttribute('cx', end.x.toFixed(2));
    this.endDotRef.nativeElement.setAttribute('cy', end.y.toFixed(2));

    const planeBox = this.planeRef.nativeElement.getBBox();
    this.planeCenter = {
      x: planeBox.x + planeBox.width / 2,
      y: planeBox.y + planeBox.height / 2
    };
    const heartBox = this.heartRef.nativeElement.getBBox();
    this.heartCenter = {
      x: heartBox.x + heartBox.width / 2,
      y: heartBox.y + heartBox.height / 2
    };

    this.animatePlane();
  }

  private animatePlane(): void {
    this.timeline?.kill();

    const reduceMotion = prefersReducedMotion(window.matchMedia?.bind(window));
    const angle = this.getAngle(this.lastStart, this.lastEnd);

    if (reduceMotion) {
      this.placePlane(this.lastEnd, angle);
      this.showHeart(this.lastEnd, true);
      return;
    }

    this.placePlane(this.lastStart, angle);
    this.showHeart(this.lastEnd, false);

    this.timeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    this.timeline
      .add(() => this.showHeart(this.lastEnd, false))
      .set(this.planeRef.nativeElement, { opacity: 1 })
      .to(this.planeRef.nativeElement, {
        duration: 0.35,
        scale: 1,
        ease: 'power2.out'
      })
      .to(this.planeRef.nativeElement, {
        duration: this.durationSeconds,
        x: this.lastEnd.x - this.planeCenter.x,
        y: this.lastEnd.y - this.planeCenter.y,
        ease: 'power2.inOut'
      })
      .set(this.planeRef.nativeElement, { opacity: 0 })
      .add(() => this.showHeart(this.lastEnd, true))
      .to(this.heartRef.nativeElement, {
        duration: 0.2,
        opacity: 1,
        scale: 1,
        ease: 'power2.out'
      });
  }

  private placePlane(point: Point, angleDeg: number): void {
    gsap.set(this.planeRef.nativeElement, {
      x: point.x - this.planeCenter.x,
      y: point.y - this.planeCenter.y,
      rotation: angleDeg,
      transformOrigin: `${this.planeCenter.x}px ${this.planeCenter.y}px`,
      scale: 0.9
    });
  }

  private showHeart(point: Point, visible: boolean): void {
    gsap.set(this.heartRef.nativeElement, {
      x: point.x - this.heartCenter.x,
      y: point.y - this.heartCenter.y,
      scale: visible ? 1 : 0.5,
      opacity: visible ? 1 : 0
    });
  }

  private getAngle(start: Point, end: Point): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const radians = Math.atan2(dy, dx);
    return (radians * 180) / Math.PI + 90;
  }
}
