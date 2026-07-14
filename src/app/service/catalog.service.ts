import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogResponse, CatalogSearchDto } from '@/model/collection';

@Injectable()
export class CatalogService {

  constructor(private http: HttpClient) { }

  search(dto: CatalogSearchDto): Observable<CatalogResponse> {
    return this.http.post<CatalogResponse>(`/api/catalog/admin/search`, dto);
  }
}
