import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagination } from '../model/pagination';
import { User, UserCreateDto, UserSearchDto } from '../model/user';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  search(dto: UserSearchDto): Observable<Pagination<User>> {
    return this.http.post<Pagination<User>>(`/api/users/search`, dto);
  }

  create(dto: UserCreateDto): Observable<User> {
    return this.http.post<User>(`/api/users`, dto);
  }
}
