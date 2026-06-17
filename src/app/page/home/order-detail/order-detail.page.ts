import { Order, OrderStatus } from "@/model/order";
import { OrderService } from "@/service/order.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardMenuImports } from "@/shared/components/menu";
import { OrderStatusComponent } from "@/shared/components/order-status/order-status.component";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectComponent, ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { CommonModule, DatePipe, Location } from "@angular/common";
import { Component, inject, OnInit, signal, viewChild } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideArrowLeft, lucideArrowRight, lucideDownload, lucideSatellite, lucideSquarePen, lucideUpload } from '@ng-icons/lucide';
import { toast } from "ngx-sonner";
import { EditOrderStatusComponent } from "./edit-order-status.component";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
    ZardBadgeComponent,
    ZardCardComponent,
    NgIcon,
    OrderStatusComponent,
  ],
  providers: [
    OrderService,
  ],
  templateUrl: './order-detail.page.html',
  viewProviders: [
    provideIcons({
      lucideSquarePen, lucideArchive, lucideSatellite, lucideArrowLeft,
      lucideUpload, lucideDownload, lucideArrowRight
    })
  ]
})
export class OrderDetailPage implements OnInit {
  statusSelector = viewChild<ZardSelectComponent>("statusSelector");
  order = signal({} as Order);
  selectedStatusList = signal<OrderStatus[]>([]);
  dialogService = inject(ZardDialogService);
  alertDialogService = inject(ZardAlertDialogService);

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    this.orderService.get(orderId).subscribe(resp => {
      this.order.set(resp);
    })
  }

  changeStatus(data?: any) {
    this.dialogService.create({
      zTitle: 'Update Order Status',
      zDescription: `Enter the status to update.`,
      zContent: EditOrderStatusComponent,
      zOkText: 'Update',
      zData: this.order(),
      zOnOk: (instance) => {
        if (instance.orderStatusForm.invalid) {
          this.changeStatus(instance.orderStatusForm.value);
          this.alertDialogService.warning({
            zTitle: 'Invalid input',
            zDescription:
              'Some of the information entered is invalid. Please review the fields and try again.',
            zOkText: 'Continue',
          });
        } else {
          const { status, reason, estimatedCollectionDate, estimatedDeliveryDate } = instance.orderStatusForm.value;
          this.orderService.updateStatus(this.order().id, { status, reason, estimatedCollectionDate, estimatedDeliveryDate }).subscribe(updateResp => {
            this.orderService.get(updateResp.id).subscribe(resp => {
              this.order.set(resp);
              toast.success('Order updated successfully', {
                description: 'status has been successfully updated.',
              });
            })
          })
        }
      },
    });
  }

  back() {
    this.location.back();
  }

  exportOrder() {
    this.orderService.exportOrder(this.order());
  }

  uploadProduct() {
    this.router.navigate(['/upload-product'], {
      queryParams: { orderId: this.order().id }
    })
  }
}