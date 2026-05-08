import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../core/auth/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [ReactiveFormsModule, TuiBadge, TuiButton, TuiCardLarge, TuiInput, TuiSelect, TuiTextarea, TuiTextfield],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Groups</span>
        <h1>Группы по интересам</h1>
        <p>Создавайте сообщества и делитесь полезными материалами внутри темы.</p>
      </div>
    </section>

    <section class="two-column two-column--wide">
      <form tuiCardLarge="normal" class="panel form-grid" [formGroup]="groupForm" (ngSubmit)="createGroup()">
        <h2>Новая группа</h2>
        <tui-textfield>
          <input tuiInput formControlName="title" />
          <label tuiLabel>Название</label>
        </tui-textfield>
        <tui-textfield>
          <select tuiSelect formControlName="category" [items]="catalog.categories()"></select>
          <label tuiLabel>Категория</label>
        </tui-textfield>
        <tui-textfield>
          <textarea tuiTextarea formControlName="description" [max]="4"></textarea>
          <label tuiLabel>Описание</label>
        </tui-textfield>
        <button tuiButton type="submit" size="m" [disabled]="groupForm.invalid">Создать</button>
      </form>

      <form tuiCardLarge="normal" class="panel form-grid" [formGroup]="materialForm" (ngSubmit)="addMaterial()">
        <h2>Поделиться материалом</h2>
        <tui-textfield>
          <select tuiSelect formControlName="groupTitle" [items]="groupTitles()"></select>
          <label tuiLabel>Группа</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput formControlName="title" />
          <label tuiLabel>Название</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput formControlName="url" />
          <label tuiLabel>Ссылка</label>
        </tui-textfield>
        <button tuiButton type="submit" size="m" [disabled]="materialForm.invalid">Добавить</button>
      </form>
    </section>

    <section class="cards-grid cards-grid--two">
      @for (group of storage.db().groups; track group.id) {
        <article tuiCardLarge="compact" class="group-card">
          <header class="panel__head">
            <div>
              <span tuiBadge appearance="neutral" size="m">{{ group.category }}</span>
              <h2>{{ group.title }}</h2>
            </div>
            <button tuiButton size="s" type="button" (click)="join(group.id)">Join</button>
          </header>
          <p>{{ group.description }}</p>
          <small>{{ group.memberIds.length }} участников</small>
          <div class="materials">
            @for (material of materials(group.id); track material.id) {
              <a [href]="material.url" target="_blank" rel="noreferrer">{{ material.title }}</a>
            }
          </div>
        </article>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  readonly storage = inject(StorageService);
  readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  readonly selectedGroupId = signal('');

  readonly groupForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['Программирование', Validators.required],
    description: ['', Validators.required],
  });

  readonly materialForm = this.fb.nonNullable.group({
    groupTitle: ['Frontend ревью', Validators.required],
    title: ['', Validators.required],
    url: ['', Validators.required],
  });

  createGroup(): void {
    const user = this.auth.currentUser();

    if (user && this.groupForm.valid) {
      this.storage.createGroup({ ...this.groupForm.getRawValue(), createdBy: user.id });
      this.groupForm.reset({ title: '', category: 'Программирование', description: '' });
    }
  }

  addMaterial(): void {
    const user = this.auth.currentUser();
    const group = this.storage.db().groups.find((item) => item.title === this.materialForm.controls.groupTitle.value);

    if (user && group && this.materialForm.valid) {
      const value = this.materialForm.getRawValue();
      this.storage.createMaterial({ groupId: group.id, userId: user.id, title: value.title, url: value.url });
      this.materialForm.reset({ groupTitle: group.title, title: '', url: '' });
    }
  }

  join(groupId: string): void {
    const user = this.auth.currentUser();

    if (user) {
      this.storage.joinGroup(groupId, user.id);
    }
  }

  groupTitles(): string[] {
    return this.storage.db().groups.map((group) => group.title);
  }

  materials(groupId: string) {
    return this.storage.db().materials.filter((material) => material.groupId === groupId);
  }
}
