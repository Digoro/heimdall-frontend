import { Order, OrderSearchDto, OrderUpdateDto } from '@/model/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';

@Injectable()
export class OrderService {

  constructor(private http: HttpClient) { }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }

  search(dto: OrderSearchDto): Observable<Pagination<Order>> {
    if (dto.email == '') dto.email = undefined;
    return this.http.post<Pagination<Order>>(`/api/orders/search`, dto);
  }

  update(id: number, dto: OrderUpdateDto): Observable<Order> {
    return this.http.put<Order>(`/api/orders/${id}`, dto);
  }
}
