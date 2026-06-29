import { ArchvingOrderExportJson as ArchiveOrderExportJson, Order, OrderSearchDto, OrderType, OrderStatusUpdateDto, TaskOrderExportJson } from '@/model/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';

@Injectable()
export class OrderService {

  constructor(private http: HttpClient) { }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/admin/${id}`);
  }

  search(dto: OrderSearchDto): Observable<Pagination<Order>> {
    if (dto.email == '') dto.email = undefined;
    return this.http.post<Pagination<Order>>(`/api/orders/admin/search`, dto);
  }

  updateStatus(id: number, dto: OrderStatusUpdateDto): Observable<Order> {
    return this.http.put<Order>(`/api/orders/admin/${id}/status`, dto);
  }

  exportOrder(order: Order) {
    if (order.type == OrderType.ARCHIVE) {
      const item = order.referencedItem;
      const archiveOrder: ArchiveOrderExportJson = {
        orderId: order.id,
        productType: order.productType,
        itemId: item.itemId
      };
      const blob = new Blob([JSON.stringify(archiveOrder, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hiemdall_ArchiveOrder_${order.id}_${order.productType}_${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    else if (order.type == OrderType.TASK) {
      const imaging = order.imaging;
      const taskOrder: TaskOrderExportJson = {
        orderId: order.id,
        productType: order.productType,
        imaging: imaging
      };
      const blob = new Blob([JSON.stringify(taskOrder, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hiemdall_TaskOrder_${order.id}_${order.productType}_${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}
