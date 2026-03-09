import { ZardInputDirective } from "@/shared/components/input";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'add-api-key-dialog',
  imports: [FormsModule, ReactiveFormsModule, ZardInputDirective],
  template: `
    <form [formGroup]="form" class="grid gap-4">
      <div class="grid gap-3">
        <label
          for="label" 
          class="flex items-center gap-2 text-sm 
          leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none 
          group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          Label
        </label>
        <input z-input formControlName="label"/>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAPIKeyComponent {
  form = new FormGroup({
    label: new FormControl('', Validators.required),
  });
}

export interface AddAPIKeyDialogData {
  label: string;
}