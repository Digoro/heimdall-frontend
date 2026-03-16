import { Order, OrderStatus } from "@/model/order";
import { OrderService } from "@/service/order.service";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardIconComponent } from "@/shared/components/icon";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { CommonModule, DatePipe, Location } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toast } from "ngx-sonner";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
    ZardBadgeComponent,
    ZardCardComponent
  ],
  providers: [
    OrderService,
  ],
  templateUrl: './order-detail.page.html',
})
export class OrderDetailPage implements OnInit {
  order = signal({} as Order);
  orderStatusList = Object.values(OrderStatus);
  selectedStatusList = signal<OrderStatus[]>([]);
  form = new FormGroup({
    status: new FormControl(''),
  });

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    this.orderService.get(orderId).subscribe(resp => {
      this.order.set(resp);
      this.form.controls.status.setValue(resp.status);
    })
  }

  changeStatus() {
    const status = OrderStatus[this.form.controls.status.value as keyof typeof OrderStatus];
    this.orderService.update(this.order().id, { status }).subscribe(resp => {
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
}