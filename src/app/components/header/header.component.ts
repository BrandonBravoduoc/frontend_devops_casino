import {
  Component, effect, ChangeDetectorRef, NgZone, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { gsap } from 'gsap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <a routerLink="/lobby" class="marca">♠ Casino Benjita lo ma grande ♦</a>

      <nav *ngIf="auth.autenticado()">
        <a routerLink="/lobby"     routerLinkActive="activo">Lobby</a>
        <a routerLink="/slots"     routerLinkActive="activo">Slots</a>
        <a routerLink="/roulette"  routerLinkActive="activo">Ruleta</a>
        <a routerLink="/blackjack" routerLinkActive="activo">Blackjack</a>
        <a routerLink="/history"   routerLinkActive="activo">Historial</a>
      </nav>

      <div class="acciones" *ngIf="auth.autenticado(); else anon">
        <a routerLink="/profile" class="saldo-pill" title="Mi perfil">
          <span class="dot"></span>
          <span class="user">{{ auth.usuario()?.username }}</span>
          <span class="ficha">$ {{ displaySaldo.val | number:'1.0-0' }}</span>
        </a>
        <button class="btn btn-secundario" (click)="salir()">Salir</button>
      </div>

      <ng-template #anon>
        <div class="acciones">
          <a routerLink="/login"    class="btn btn-secundario">Login</a>
          <a routerLink="/register" class="btn btn-primario">Registrarse</a>
        </div>
      </ng-template>
    </header>
  `,
  styles: [`
    .barra {
      display: flex; align-items: center; gap: 24px;
      padding: 0 32px; height: 58px;
      background: rgba(3,9,18,0.9);
      border-bottom: 1px solid rgba(16,185,129,0.12);
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(14px);
    }
    .marca {
      font-family: 'Georgia', serif;
      font-size: 17px; letter-spacing: 4px; text-transform: uppercase;
      background: linear-gradient(90deg, #b8902a, #f0d060, #d4af37, #f0d060, #b8902a);
      background-size: 300% 100%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.5s linear infinite;
      text-decoration: none;
    }
    @keyframes shimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    nav { display: flex; gap: 2px; flex: 1; }
    nav a {
      font-size: 12px; padding: 5px 13px; border-radius: 6px;
      color: #6a8a7a; letter-spacing: 0.3px;
      transition: color 0.2s;
    }
    nav a.activo {
      background: rgba(16,185,129,0.1);
      color: #10b981;
      border: 1px solid rgba(16,185,129,0.22);
    }
    .acciones { display: flex; gap: 12px; align-items: center; }
    .saldo-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 14px 5px 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(212,175,55,0.28);
      border-radius: 999px;
      text-decoration: none;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #10b981; box-shadow: 0 0 7px #10b981;
      animation: dot-pulse 2.2s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes dot-pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.5); opacity: 0.6; }
    }
    .user  { font-size: 12px; color: #9ab8b0; }
    .ficha { font-size: 13px; font-weight: 700; color: #d4af37; font-variant-numeric: tabular-nums; }
  `],
})
export class HeaderComponent implements OnDestroy {
  readonly displaySaldo = { val: 0 };
  private tween?: gsap.core.Tween;

  constructor(public auth: AuthService, private router: Router) {
    const cdr = inject(ChangeDetectorRef);
    const ngZone = inject(NgZone);

    effect(() => {
      const saldo = Number(this.auth.usuario()?.saldo ?? 0);
      const prev  = this.displaySaldo.val;
      const dur   = Math.min(0.8, Math.max(0.3, Math.abs(saldo - prev) / 5000));

      this.tween?.kill();
      this.tween = ngZone.runOutsideAngular(() =>
        gsap.to(this.displaySaldo, {
          val: saldo, duration: dur, ease: 'power2.out',
          onUpdate: () => ngZone.run(() => cdr.markForCheck()),
        })
      );
    });
  }

  salir(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.tween?.kill();
  }
}
