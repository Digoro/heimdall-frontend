import { Role } from '@/model/user';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from "@/shared/components/input";
import { ZardSelectImports } from '@/shared/components/select';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'add-user-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardInputDirective,
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardSelectImports
  ],
  templateUrl: './add-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserComponent implements AfterViewInit {
  private zData: any = inject(Z_MODAL_DATA);
  roles = Object.values(Role);
  userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(1), Validators.maxLength(255)]),
    department: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
    role: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,100}$/)]),
  });

  ngAfterViewInit(): void {
    if (this.zData) {
      this.userForm.patchValue(this.zData);
    }
  }
}

export interface AddUserDialogData {
  label: string;
}