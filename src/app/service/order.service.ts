import { Order, OrderSearchDto } from '@/model/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';

@Injectable()
export class OrderService {

  constructor(private http: HttpClient) { }

  search(dto: OrderSearchDto): Observable<Pagination<Order>> {
    if (dto.email == '') dto.email = undefined;
    return this.http.post<Pagination<Order>>(`/api/orders/search`, dto);
  }

}
