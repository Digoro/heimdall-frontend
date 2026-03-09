import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true }); //
      return { mustMatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
};