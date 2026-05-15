import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';
import { User, UserCreateDto, UserSearchDto, UserUpdateDto } from '../model/user';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  search(dto: UserSearchDto): Observable<Pagination<User>> {
    return this.http.post<Pagination<User>>(`/api/users/admin/search`, dto);
  }

  create(dto: UserCreateDto): Observable<User> {
    return this.http.post<User>(`/api/users/admin`, dto);
  }

  delete(id: number) {
    return this.http.delete(`/api/users/admin/${id}`);
  }

  update(id: number, dto: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`/api/users/admin/${id}`, dto);
  }

  getWebhook(): Observable<{ webhookUrl: string, isExsitWebhookSecret: boolean }> {
    return this.http.get<{ webhookUrl: string, isExsitWebhookSecret: boolean }>(`/api/users/webhook`);
  }

  deleteWebhook(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/users/webhook`);
  }

  registerWebhook(webhookUrl: string, isEditWebhookSecret: boolean, webhookSecret?: string): Observable<{ webhookUrl: string, isExsitWebhookSecret: boolean }> {
    return this.http.post<{ webhookUrl: string, isExsitWebhookSecret: boolean }>(`/api/users/webhook`, { webhookUrl, isEditWebhookSecret, webhookSecret });
  }
}
