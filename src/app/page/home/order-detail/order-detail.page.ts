import { Order, OrderStatus } from "@/model/order";
import { OrderService } from "@/service/order.service";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectComponent, ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { CommonModule, DatePipe, Location } from "@angular/common";
import { Component, OnInit, signal, viewChild } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { toast } from "ngx-sonner";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideArrowLeft, lucideDownload, lucideSatellite, lucideSquarePen, lucideUpload } from '@ng-icons/lucide';
import { OrderStatusComponent } from "@/shared/components/order-status/order-status.component";

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
    OrderStatusComponent
  ],
  providers: [
    OrderService,
  ],
  templateUrl: './order-detail.page.html',
  viewProviders: [
    provideIcons({
      lucideSquarePen, lucideArchive, lucideSatellite, lucideArrowLeft,
      lucideUpload, lucideDownload
    })
  ]
})
export class OrderDetailPage implements OnInit {
  statusSelector = viewChild<ZardSelectComponent>("statusSelector");
  order = signal({} as Order);
  orderStatusList = Object.values(OrderStatus);
  selectedStatusList = signal<OrderStatus[]>([]);
  form = new FormGroup({
    status: new FormControl(''),
  });
  isStatusEdit = signal(false);

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
      this.form.controls.status.setValue(resp.status);
    })
  }

  changeStatus() {
    const status = this.form.controls.status.value as OrderStatus;
    this.orderService.updateStatus(this.order().id, { status }).subscribe(resp => {
      this.order.set(resp);
      this.isStatusEdit.set(false);
      toast.success('Order updated successfully', {
        description: 'status has been successfully updated.',
      });
    })
  }

  back() {
    this.location.back();
  }

  exportOrder() {
    this.orderService.exportOrder(this.order());
  }

  editOrderStatus() {
    this.isStatusEdit.set(!this.isStatusEdit());
    setTimeout(() => {
      this.statusSelector()?.toggle();
    })
  }

  uploadProduct() {
    this.router.navigate(['/upload-product'], {
      queryParams: { orderId: this.order().id }
    })
  }
}