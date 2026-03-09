import { ResponseCreateAPIKey } from "@/model/apiKey";
import { ZardButtonComponent } from "@/shared/components/button";
import { Z_MODAL_DATA } from "@/shared/components/dialog";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardPopoverComponent, ZardPopoverDirective } from "@/shared/components/popover";
import { Clipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'add-api-key-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective
  ],
  template: `
  <form [formGroup]="form" >
    <div class="flex gap-2">
      <input z-input formControlName="key"/>
      <button z-button zPopover [zContent]="popoverContent" zType="outline" (click)="copy()">Copy</button>
    </div>
  </form>

  <ng-template #popoverContent>
    <z-popover class="w-full">
        <p class="text-muted-foreground text-sm">Copy to Clipboard!</p>
    </z-popover>
</ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAPIKeyComponent implements AfterViewInit {
  private zData: ResponseCreateAPIKey = inject(Z_MODAL_DATA);

  form = new FormGroup({
    key: new FormControl('', Validators.required),
  });

  constructor(
    public clipboard: Clipboard
  ) {

  }

  ngAfterViewInit(): void {
    if (this.zData) {
      this.form.patchValue(this.zData);
    }
  }

  copy() {
    this.clipboard.copy(this.zData.key);
  }
}