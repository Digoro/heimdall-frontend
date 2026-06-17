import { Order, OrderStatus, OrderType } from '@/model/order';
import { ZardDatePickerComponent } from '@/shared/components/date-picker';
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
    ZardSelectImports,
    ZardDatePickerComponent
  ],
  templateUrl: './edit-order-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOrderStatusComponent implements AfterViewInit {
  private order: Order = inject(Z_MODAL_DATA);
  orderStatusList = Object.values(OrderStatus);
  orderStatusForm = new FormGroup<any>({
    status: new FormControl(''),
  });
  maxDate = new Date(2100, 1, 1);

  ngAfterViewInit(): void {
    if (this.order) {
      this.orderStatusForm.patchValue(this.order);
    }
  }

  changeStatus() {
    const status = this.orderStatusForm.controls['status'].value;
    if (status == OrderStatus.REJECTED || status == OrderStatus.FAILED) {
      this.orderStatusForm.addControl('reason', new FormControl(''));
    } else if (status == OrderStatus.PENDING) {
      if (this.order.type == OrderType.ARCHIVE) {
        this.orderStatusForm.addControl('estimatedDeliveryDate', new FormControl('', Validators.required));
      } else if (this.order.type == OrderType.TASK) {
        this.orderStatusForm.addControl('estimatedCollectionDate', new FormControl('', Validators.required));
        this.orderStatusForm.addControl('estimatedDeliveryDate', new FormControl('', Validators.required));
      }
    } else {
      this.orderStatusForm.removeControl('reason');
      this.orderStatusForm.removeControl('estimatedCollectionDate');
      this.orderStatusForm.removeControl('estimatedDeliveryDate');
    }
  }
}

export interface AddUserDialogData {
  label: string;
}