import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { CatalogService } from '../../core/services/catalog.service';
import { ProfileStore } from '../../core/stores/profile.store';
import { LevelPipe } from '../../shared/pipes/level.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, LevelPipe, TuiBadge, TuiButton, TuiCardLarge, TuiInput, TuiSelect, TuiTextarea, TuiTextfield],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Profile</span>
        <h1>Профиль и навыки</h1>
        <p>Чем точнее заполнены навыки, тем лучше работает compatibility score.</p>
      </div>
    </section>

    <section class="two-column two-column--wide">
      <form tuiCardLarge="normal" class="panel form-grid" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <h2>Данные</h2>
        <tui-textfield>
          <input tuiInput formControlName="name" />
          <label tuiLabel>Имя</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput formControlName="city" />
          <label tuiLabel>Город</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput formControlName="avatarUrl" />
          <label tuiLabel>Аватар URL</label>
        </tui-textfield>
        <tui-textfield>
          <textarea tuiTextarea formControlName="bio" [max]="4"></textarea>
          <label tuiLabel>Bio</label>
        </tui-textfield>
        @if (profileForm.controls.bio.invalid) {
          <small class="field-error">Bio не длиннее 300 символов</small>
        }
        <button tuiButton type="submit" size="m" [disabled]="profileForm.invalid">Сохранить</button>
      </form>

      <article tuiCardLarge="normal" class="panel form-grid">
        <h2>Добавить навык</h2>
        <form [formGroup]="skillForm" (ngSubmit)="addSkill('teach')" class="inline-form">
          <tui-textfield>
            <select tuiSelect formControlName="skillName" [items]="skillNames()"></select>
            <label tuiLabel>Навык</label>
          </tui-textfield>
          <tui-textfield>
            <select tuiSelect formControlName="level" [items]="levels"></select>
            <label tuiLabel>Уровень</label>
          </tui-textfield>
          <button tuiButton type="submit" size="m">Могу обучать</button>
          <button tuiButton appearance="secondary" type="button" size="m" (click)="addSkill('learn')">Хочу изучить</button>
        </form>

        <div class="skill-lists">
          <div>
            <h3>Могу обучать</h3>
            <div class="chips">
              @for (item of store.teachSkills(); track item.id) {
                <button tuiBadge appearance="info" size="xl" type="button" (click)="store.removeSkill(item.id)">
                  {{ catalog.skillName(item.skillId) }} · {{ item.level | levelLabel }} ×
                </button>
              }
            </div>
          </div>
          <div>
            <h3>Хочу изучить</h3>
            <div class="chips">
              @for (item of store.learnSkills(); track item.id) {
                <button tuiBadge appearance="neutral" size="xl" type="button" (click)="store.removeSkill(item.id)">
                  {{ catalog.skillName(item.skillId) }} · {{ item.level | levelLabel }} ×
                </button>
              }
            </div>
          </div>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly store = inject(ProfileStore);
  readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);

  readonly levels = ['beginner', 'intermediate', 'advanced'];

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.store.user()?.name ?? '', Validators.required],
    city: [this.store.user()?.city ?? ''],
    avatarUrl: [this.store.user()?.avatarUrl ?? ''],
    bio: [this.store.user()?.bio ?? '', Validators.maxLength(300)],
  });

  readonly skillForm = this.fb.nonNullable.group({
    skillName: ['Angular', Validators.required],
    level: ['intermediate', Validators.required],
  });

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.store.updateProfile(this.profileForm.getRawValue());
    }
  }

  addSkill(type: 'teach' | 'learn'): void {
    if (this.skillForm.valid) {
      const value = this.skillForm.getRawValue();
      const skill = this.catalog.skills().find((item) => item.name === value.skillName);

      if (skill) {
        this.store.addSkill(type, skill.id, value.level as 'beginner' | 'intermediate' | 'advanced');
      }
    }
  }

  skillNames(): string[] {
    return this.catalog.skills().map((skill) => skill.name);
  }
}
