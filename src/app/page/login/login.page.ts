import { AuthService } from '@/service/auth.service';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from '@/shared/components/input';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
  ],
  providers: [
    AuthService
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  isLoading = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe(resp => {
      this.router.navigate(['/users']);
      this.isLoading.set(false);
    }, err => {
      this.isLoading.set(false);
    })
  }

  goToSignUp(event: Event) {
    event.preventDefault();
    this.router.navigate(['/signup']);
  }
}
