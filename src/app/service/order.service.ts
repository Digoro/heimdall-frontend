import { Order, OrderSearchDto } from '@/model/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';
import { User, UserCreateDto, UserUpdateDto } from '../model/user';

@Injectable()
export class OrderService {

  constructor(private http: HttpClient) { }

  search(dto: OrderSearchDto): Observable<Pagination<Order>> {
    if (dto.email == '') dto.email = undefined;
    return this.http.post<Pagination<Order>>(`/api/orders/search`, dto);
  }

  create(dto: UserCreateDto): Observable<User> {
    return this.http.post<User>(`/api/users`, dto);
  }

  delete(id: number) {
    return this.http.delete(`/api/users/${id}`);
  }

  update(id: number, dto: UserUpdateDto): Observable<User> {
    dto.dailyLimit = +dto.dailyLimit;
    dto.monthlyLimit = +dto.monthlyLimit;
    return this.http.put<User>(`/api/users/${id}`, dto);
  }
}
