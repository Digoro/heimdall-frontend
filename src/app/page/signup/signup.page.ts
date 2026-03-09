import { UserCreateDto } from '@/model/user';
import { UserService } from '@/service/user.service';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from '@/shared/components/input';
import { matchValidator } from '@/shared/utils/match-validator';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
  ],
  providers: [
    UserService
  ],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  isLoading = signal(false);

  loginForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(1), Validators.maxLength(255)]),
    department: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,100}$/)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,100}$/)]),
  }, {
    validators: matchValidator('password', 'confirmPassword')
  });

  alertDialogService = inject(ZardAlertDialogService);

  constructor(
    private userService: UserService,
    private router: Router
  ) {
  }

  signup(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    const { name, email, department, password, confirmPassword } = this.loginForm.value;
    const dto = new UserCreateDto(name!, email!, department!, password!);
    this.userService.create(dto).subscribe(resp => {
      this.isLoading.set(false);
      this.alertDialogService.info({
        zTitle: 'Registration Successful!',
        zDescription: 'Your account has been created successfully. Please log in to continue.',
        zOkText: 'Ok',
        zOnOk: () => {
          this.router.navigate(['/home']);
        }
      });
    }, err => {
      this.isLoading.set(false);
    })
  }

  goToSignIn(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
