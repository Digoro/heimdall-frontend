import { Order, OrderStatus } from '@/model/order';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/shared/components/form';
import { ZardInputDirective } from "@/shared/components/input";
import { ZardSelectImports } from '@/shared/components/select';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";

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
    ZardSelectImports,
  ],
  templateUrl: './edit-order-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOrderStatusComponent implements AfterViewInit {
  private zData: Order = inject(Z_MODAL_DATA);
  orderStatusList = Object.values(OrderStatus);
  orderStatusForm = new FormGroup<any>({
    status: new FormControl(''),
  });

  ngAfterViewInit(): void {
    if (this.zData) {
      this.orderStatusForm.patchValue(this.zData);
    }
  }

  changeStatus() {
    const status = this.orderStatusForm.controls['status'].value;
    if (status == OrderStatus.REJECTED || status == OrderStatus.FAILED) {
      this.orderStatusForm.addControl('reason', new FormControl(''));
    } else {
      this.orderStatusForm.removeControl('reason');
    }

    if (status == OrderStatus.PENDING) {

    }
  }
}

export interface AddUserDialogData {
  label: string;
}