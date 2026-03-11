import { Order, OrderStatus, OrderType } from "@/model/order";
import { PaginationMeta } from "@/model/pagination";
import { OrderService } from "@/service/order.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardIconComponent } from "@/shared/components/icon";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardInputGroupComponent } from "@/shared/components/input-group";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  standalone: true,
  imports: [
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
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardBadgeComponent,
  ],
  providers: [
    OrderService,
  ],
  templateUrl: './order-list.page.html',
})
export class OrderListPage implements OnInit {
  fb = inject(FormBuilder);
  orderStatusList = Object.values(OrderStatus);
  selectedStatusList = signal<OrderStatus[]>([]);
  orderTypeList = Object.values(OrderType);
  selectedTypeList = signal<OrderType[]>([]);

  searchForm = this.fb.group({
    email: [''],
  });

  rows = '10';
  page = signal(1);
  limit = signal(10);

  orders = signal<Order[]>([]);
  meta = signal<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 0
  });
  dialogService = inject(ZardDialogService);
  alertDialogService = inject(ZardAlertDialogService);

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const { page, limit, email, statusList, typeList } = params;
      if (page) this.page.set(+page);
      if (limit) {
        this.limit.set(+limit);
        this.rows = `${limit}`;
      }
      if (email) this.searchForm.controls.email.setValue(email);
      if (statusList) this.selectedStatusList.set(statusList ? (typeof (statusList) == 'string' ? [statusList] : statusList) : undefined);
      if (typeList) this.selectedTypeList.set(typeList ? (typeof (typeList) == 'string' ? [typeList] : typeList) : undefined);
      this.orderService.search({ page: this.page(), limit: this.limit(), email, statusList: this.selectedStatusList(), typeList: this.selectedTypeList() }).subscribe(resp => {
        this.orders.set(resp.items);
        this.meta.set(resp.meta);
      });
    })
  }

  searchOrders(page?: number) {
    if (page) this.page.set(1);
    const email = this.searchForm.controls.email.value!;
    const statusList = this.selectedStatusList();
    const typeList = this.selectedTypeList();
    this.router.navigate([], {
      queryParams: { page: this.page(), limit: this.limit(), email, statusList, typeList },
      queryParamsHandling: 'replace'
    })
  }

  rowsChange() {
    this.page.set(1);
    this.limit.set(+this.rows);
    this.searchOrders();
  }

  pageChange(event: number) {
    this.page.set(event);
    this.searchOrders();
  }

  viewDetail(order: Order) {
    this.router.navigate(['/orders', order.id])
  }
}