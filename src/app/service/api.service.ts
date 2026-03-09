import { APIKey, APIKeyStatus, CreateAPIKeyDto, ResponseCreateAPIKey, UpdateAPIKeyDto } from '@/model/apiKey';
import { PaginationSearchDto } from '@/model/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';

@Injectable()
export class APIService {

  constructor(private http: HttpClient) { }

  search(dto: PaginationSearchDto): Observable<Pagination<APIKey>> {
    return this.http.post<Pagination<APIKey>>(`/api/apiKeys/search`, dto);
  }

  create(dto: CreateAPIKeyDto): Observable<ResponseCreateAPIKey> {
    return this.http.post<ResponseCreateAPIKey>(`/api/apiKeys`, dto);
  }

  update(id: number, dto: UpdateAPIKeyDto): Observable<{ status: APIKeyStatus }> {
    return this.http.put<{ status: APIKeyStatus }>(`/api/apiKeys/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`/api/apiKeys/${id}`);
  }
}
