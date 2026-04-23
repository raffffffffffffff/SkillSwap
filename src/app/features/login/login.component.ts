import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiInput, TuiTextfield],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <a class="brand brand--public" routerLink="/">
          <span class="brand__logo">SS</span>
          <span>SkillSwap</span>
        </a>
        <h1>Вход</h1>
        <p>Demo: alina&#64;example.com / password</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <tui-textfield>
            <input tuiInput type="email" formControlName="email" />
            <label tuiLabel>Email</label>
          </tui-textfield>
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small class="field-error">Введите корректный email</small>
          }

          <tui-textfield>
            <input tuiInput type="password" formControlName="password" />
            <label tuiLabel>Пароль</label>
          </tui-textfield>
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="field-error">Минимум 6 символов</small>
          }

          @if (error) {
            <p class="form-error">{{ error }}</p>
          }

          <button class="auth-submit" tuiButton type="submit" size="l" [disabled]="form.invalid">Войти</button>
        </form>
        <a routerLink="/register">Создать аккаунт</a>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  error = '';

  readonly form = this.fb.nonNullable.group({
    email: ['alina@example.com', [Validators.required, Validators.email]],
    password: ['password', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const ok = this.auth.login(this.form.controls.email.value, this.form.controls.password.value);

    if (!ok) {
      this.error = 'Неверный email или пароль';
      return;
    }

    void this.router.navigateByUrl('/dashboard');
  }
}
