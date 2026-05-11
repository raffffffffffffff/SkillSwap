import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).login('alina@example.com', 'password');
  });

  it('validates required name and bio max length', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;

    component.profileForm.patchValue({ name: '', bio: 'x'.repeat(301) });

    expect(component.profileForm.invalid).toBe(true);
    expect(component.profileForm.controls.name.hasError('required')).toBe(true);
    expect(component.profileForm.controls.bio.hasError('maxlength')).toBe(true);
  });
});
