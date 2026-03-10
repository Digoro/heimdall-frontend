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
import { debounceTime, distinctUntilChanged } from "rxjs";

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
    ZardBadgeComponent
  ],
  providers: [
    OrderService,
  ],
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
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

  orders = signal<Order[]>([]);
  meta = signal<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 0
  });
  rows = '10';
  dialogService = inject(ZardDialogService);
  alertDialogService = inject(ZardAlertDialogService);

  constructor(
    public orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.searchOrders(1);
    this.searchForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(resp => {
      this.searchOrders(1);
    });
  }

  statusSelectChange() {
    this.searchOrders(1);
  }

  private searchOrders(page: number) {
    const limit = +this.rows;
    const email = this.searchForm.controls.email.value!;
    const statusList = this.selectedStatusList();
    const typeList = this.selectedTypeList();
    this.orderService.search({ page, limit, email, statusList, typeList }).subscribe(resp => {
      this.orders.set(resp.items);
      this.meta.set(resp.meta);
    });
  }

  rowsChange() {
    this.searchOrders(1);
  }

  pageChange(event: number) {
    this.searchOrders(event);
  }
}

