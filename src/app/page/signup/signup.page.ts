import { UserCreateDto } from '@/model/user';
import { AuthService } from '@/service/auth.service';
import { UserService } from '@/service/user.service';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from '@/shared/components/input';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'signup',
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
    AuthService,
    UserService
  ],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  isLoading = signal(false);

  loginForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    department: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  signup(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    const { name, email, department, password, confirmPassword } = this.loginForm.value;
    const dto = new UserCreateDto(name!, email!, department!, password!);
    this.userService.create(dto).subscribe(resp => {
      this.router.navigate(['/users']);
      this.isLoading.set(false);
    }, err => {
      this.isLoading.set(false);
    })
  }

  goToSignIn(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
