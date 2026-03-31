import { ArchvingOrderExportJson, Order, OrderSearchDto, OrderType, OrderUpdateDto, TaskingOrderExportJson } from '@/model/order';
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

  updateStatus(id: number, dto: OrderUpdateDto): Observable<Order> {
    return this.http.put<Order>(`/api/orders/admin/${id}/status`, dto);
  }

  exportOrder(order: Order) {
    if (order.type == OrderType.ARCHVING_ORDER) {
      const catalog = order.catalog;
      const archvingOrder: ArchvingOrderExportJson = {
        orderId: order.id,
        catalogId: order.catalog.id,
        productType: order.productType,
        imagingMode: catalog.imagingMode,
        imagingStartAt: catalog.imagingStartAt.toString(),
        imagingEndAt: catalog.imagingEndAt.toString(),
        geometry: JSON.stringify(catalog.geometry),
        target: catalog.target,
        polarization: catalog.polarization,
        resolution: catalog.resolution,
        projection: catalog.projection,
        geoTransform: catalog.geoTransform,
        offNadirAngle: catalog.offNadirAngle,
      }
      const blob = new Blob([JSON.stringify(archvingOrder, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OMS_ArchvingOrder_${order.id}_${order.productType}_${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    else if (order.type == OrderType.TASKING_ORDER) {
      const imaging = order.imaging;
      const taskingOrder: TaskingOrderExportJson = {
        orderId: order.id,
        geometry: {},
        productLevel: order.productType,
        imagingMode: imaging.imagingMode,
        windowOpen: imaging.windowOpen.toString(),
        windowClose: imaging.windowClose.toString(),
        collectionConstraints: {}
      }
      const blob = new Blob([JSON.stringify(taskingOrder, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OMS_TaskingOrder_${order.id}_${order.productType}_${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}
