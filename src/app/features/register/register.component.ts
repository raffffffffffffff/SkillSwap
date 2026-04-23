import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiInput, TuiTextfield],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <a class="brand brand--public" routerLink="/">
          <span class="brand__logo">SS</span>
          <span>SkillSwap</span>
        </a>
        <h1>Регистрация</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <tui-textfield>
            <input tuiInput formControlName="name" />
            <label tuiLabel>Имя</label>
          </tui-textfield>
          <tui-textfield>
            <input tuiInput type="email" formControlName="email" />
            <label tuiLabel>Email</label>
          </tui-textfield>
          <tui-textfield>
            <input tuiInput type="password" formControlName="password" />
            <label tuiLabel>Пароль</label>
          </tui-textfield>
          <tui-textfield>
            <input tuiInput type="password" formControlName="confirm" />
            <label tuiLabel>Повтор пароля</label>
          </tui-textfield>

          @if (error) {
            <p class="form-error">{{ error }}</p>
          }

          <button class="auth-submit" tuiButton type="submit" size="l" [disabled]="form.invalid">Создать аккаунт</button>
        </form>
        <a routerLink="/login">Уже есть аккаунт</a>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  error = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirm.value) {
      this.error = 'Пароли должны совпадать';
      return;
    }

    try {
      this.auth.register(this.form.controls.name.value, this.form.controls.email.value, this.form.controls.password.value);
      void this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.error = (error as Error).message;
    }
  }
}
